import type {
  CLI,
  CLIOptions,
  CLIPlugin,
  Command as ICommand,
  CommandBuilder,
  ActionHandler,
  Middleware,
  OptionDef,
} from './types.js';
import type { Token } from './parser/tokenizer.js';
import { Command } from './command/command.js';
import { CLIKernelImpl } from './kernel.js';
import { tokenize } from './parser/tokenizer.js';
import { parseArguments } from './parser/arguments.js';
import { parseOptions } from './parser/options.js';
import {
  CLIError,
  UnknownCommandError,
  MissingArgumentError,
  ValidationError,
} from './errors/cli-error.js';
import { findBestMatch } from './utils/levenshtein.js';

/**
 * CLI application class
 */
export class CLIImplementation implements CLI {
  readonly name: string;
  _version = '0.0.0';
  _description = '';
  readonly commands = new Map<string, Command>();
  options: OptionDef[] = [];
  readonly plugins = new Set<string>();

  private kernel: CLIKernelImpl;
  private _strict = false;
  private root: Command;
  private _pendingMiddleware: Middleware[] = [];

  constructor(options: CLIOptions) {
    this.name = options.name;
    this._version = options.version ?? '0.0.0';
    this._description = options.description ?? '';
    this._strict = options.strict ?? false;

    this.kernel = new CLIKernelImpl();
    this.root = new Command(options.name);
    this.root.description = this._description;

    if (options.plugins) {
      for (const plugin of options.plugins) {
        this.use(plugin);
      }
    }
  }

  setVersion(v: string): this {
    this._version = v;
    return this;
  }

  version(): string;
  version(v: string): this;
  version(v?: string): string | this {
    if (v === undefined) {
      return this._version;
    }
    this._version = v;
    return this;
  }

  describe(d: string): this {
    this._description = d;
    this.root.description = d;
    return this;
  }

  // Fluent API for description (matches examples)
  description(): string;
  description(d: string): this;
  description(d?: string): string | this {
    if (d === undefined) {
      return this._description;
    }
    this._description = d;
    this.root.description = d;
    return this;
  }

  command(name: string): CommandBuilder {
    const cmd = this.root.addCommand(name);
    this.commands.set(name, cmd);
    return new CommandBuilderImpl(this, cmd);
  }

  option(flags: string, desc?: string, opts?: Partial<OptionDef>): this {
    const { name, alias, type } = this.parseOptionFlagsInternal(flags);
    const def: OptionDef = { name, alias, type, description: desc, ...opts };
    this.options.push(def);
    return this;
  }

  use(plugin: CLIPlugin): this {
    this.kernel.register(plugin);
    this.plugins.add(plugin.name);
    return this;
  }

  // Add middleware (requires middleware plugin)
  middleware(mw: Middleware): this {
    // Store pending middleware until plugin is initialized
    this._pendingMiddleware.push(mw);
    // If _use is already available (plugin initialized), also add there
    if ((this as any)._use) {
      (this as any)._use(mw);
    }
    return this;
  }

  run(argv?: string[]): void {
    const args = argv ?? process.argv.slice(2);
    // Set app in context so plugins can access it during initialization
    this.kernel.setContextValue('app', this);
    void this.kernel.initialize().then(() => this.execute(args));
  }

  async runAsync(argv?: string[]): Promise<void> {
    const args = argv ?? process.argv.slice(2);
    // Set app in context so plugins can access it during initialization
    this.kernel.setContextValue('app', this);
    await this.kernel.initialize();
    await this.execute(args);
  }

  private async execute(argv: string[]): Promise<void> {
    try {
      const tokens = tokenize(argv);

      if (tokens.length === 0) {
        await this.showHelp();
        return;
      }

      const { command, tokenIndex } = this.findCommand(tokens);
      const remainingTokens = tokens.slice(tokenIndex);
      const parseResult = this.parseCommandTokens(command, remainingTokens);

      if (parseResult.errors.length > 0) {
        for (const error of parseResult.errors) {
          console.error(error);
        }
        throw new ValidationError('Validation failed');
      }

      const context = {
        args: parseResult.args,
        options: parseResult.options,
        argv,
        command,
        app: this,
      };

      await this.executeCommand(command, context);
    } catch (error) {
      await this.handleError(error as Error);
    }
  }

  private findCommand(tokens: Token[]): { command: Command; tokenIndex: number } {
    let command = this.root;
    let tokenIndex = 0;

    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      if (!token || token.type !== 'argument') break;

      const subcommand = command.getByNameOrAlias(token.value);
      if (!subcommand) break;

      command = subcommand;
      tokenIndex++;
    }

    return { command, tokenIndex };
  }

  private parseCommandTokens(
    command: Command,
    tokens: Token[]
  ): { args: Record<string, unknown>; options: Record<string, unknown>; errors: string[] } {
    const optResult = parseOptions(tokens, command.options, this._strict);
    const argResult = parseArguments(optResult.remaining, command.arguments);

    return {
      args: argResult.values,
      options: optResult.values,
      errors: [...optResult.errors, ...argResult.errors],
    };
  }

  private async executeCommand(command: Command, context: Record<string, unknown>): Promise<void> {
    await this.kernel.emit('command:before', { command, context });

    // Only execute command middleware if the middleware plugin is NOT installed
    // The middleware plugin handles both global and command-specific middleware
    if (!(this as any)._middlewarePluginInstalled && command.middleware.length > 0) {
      let index = 0;
      const next = async () => {
        if (index < command.middleware.length) {
          const mw = command.middleware[index++];
          await mw(context as any, next);
        }
      };
      await next();
    }

    if (command.action) {
      await command.action(context as any);
    }

    await this.kernel.emit('command:after', { command, context });
  }

  private async handleError(error: Error): Promise<void> {
    await this.kernel.emit('error', error);

    if (error instanceof CLIError) {
      console.error(error.message);

      if (error instanceof UnknownCommandError) {
        const suggestion = this.suggestCommand(error.command);
        if (suggestion) {
          console.error(`\nDid you mean "${suggestion}"?`);
        }
      }

      process.exit(error.exitCode);
    } else {
      console.error('Unexpected error:', error.message);
      process.exit(1);
    }
  }

  private suggestCommand(name: string): string | undefined {
    const candidates = Array.from(this.commands.keys());
    return findBestMatch(name, candidates, 0.6);
  }

  private async showHelp(): Promise<void> {
    await this.kernel.emit('help', { app: this });

    console.log(`Usage: ${this.name} [command] [options]`);

    if (this.commands.size > 0) {
      console.log('\nCommands:');
      for (const cmd of this.commands.values()) {
        console.log(`  ${cmd.name.padEnd(20)} ${cmd.description || ''}`);
      }
    }

    if (this.options.length > 0) {
      console.log('\nOptions:');
      for (const opt of this.options) {
        const flags = this.formatOptionFlags(opt);
        console.log(`  ${flags.padEnd(20)} ${opt.description || ''}`);
      }
    }
  }

  private formatOptionFlags(opt: OptionDef): string {
    let flags = '';
    if (opt.alias) {
      flags += `-${opt.alias}, `;
    }
    flags += `--${opt.name}`;
    if (opt.type !== 'boolean') {
      flags += ` <${opt.type || 'value'}>`;
    }
    return flags;
  }

  parseOptionFlagsInternal(flags: string): {
    name: string;
    alias?: string;
    type: OptionDef['type'];
  } {
    const parts = flags.split(/[,\s]+/).filter(Boolean);

    let name = '';
    let alias: string | undefined;
    let expectsValue = false;

    for (const part of parts) {
      if (part.startsWith('--')) {
        name = part.slice(2);
      } else if (part.startsWith('-')) {
        alias = part.slice(1);
      } else if (part.startsWith('<')) {
        expectsValue = true;
      }
    }

    let type: OptionDef['type'] = 'string';
    if (!expectsValue) {
      type = 'boolean';
    } else if (parts.some((p) => p.includes('<number>'))) {
      type = 'number';
    } else if (parts.some((p) => p.includes('...'))) {
      type = 'array';
    }

    return { name, alias, type };
  }
}

/**
 * Command builder implementation
 */
class CommandBuilderImpl implements CommandBuilder {
  private cli: CLIImplementation;
  readonly _command: Command;

  constructor(cli: CLIImplementation, command: Command) {
    this.cli = cli;
    this._command = command;
  }

  description(description: string): this {
    this._command.description = description;
    return this;
  }

  describe(description: string): this {
    this._command.description = description;
    return this;
  }

  argument(def: string, description?: string): this {
    const required = def.startsWith('<');
    const variadic = def.endsWith('...');
    const name = def.slice(1, -1).replace('...', '');

    this._command.addArgument({ name, required, variadic, description });
    return this;
  }

  option(flags: string, description?: string, options?: Partial<OptionDef>): this {
    const { name, alias, type } = this.cli.parseOptionFlagsInternal(flags);
    this._command.addOption({ name, alias, type, description, ...options });
    return this;
  }

  alias(...aliases: string[]): this {
    this._command.aliases.push(...aliases);
    return this;
  }

  action(handler: ActionHandler): this {
    this._command.action = handler;
    return this;
  }

  use(middleware: Middleware): this {
    this._command.middleware.push(middleware);
    return this;
  }

  command(name: string): CommandBuilder {
    return this.addCommand(name);
  }

  addCommand(name: string): CommandBuilder {
    const cmd = this._command.addCommand(name);
    // Don't add to cli.commands - subcommands are stored in parent command's commands map
    return new CommandBuilderImpl(this.cli, cmd);
  }

  parent(): CLI {
    return this.cli;
  }
}

/**
 * Create a CLI application
 */
export function cli(nameOrOptions: string | CLIOptions): CLI {
  const options = typeof nameOrOptions === 'string' ? { name: nameOrOptions } : nameOrOptions;
  return new CLIImplementation(options);
}
