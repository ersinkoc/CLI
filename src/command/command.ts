import type {
  Command as ICommand,
  ArgumentDef,
  OptionDef,
  ActionHandler,
  Middleware,
} from '../types.js';

/**
 * Command class representing a CLI command
 *
 * @example
 * ```typescript
 * const cmd = new Command('build');
 * cmd.description = 'Build the project';
 * cmd.addArgument({ name: 'input', required: true });
 * cmd.addOption({ name: 'output', alias: 'o' });
 * cmd.action = async ({ args, options }) => {
 *   console.log('Building...');
 * };
 * ```
 */
export class Command implements ICommand {
  /** Command name */
  readonly name: string;

  /** Command description */
  description = '';

  /** Command aliases */
  aliases: string[] = [];

  /** Parent command (if nested) */
  parent?: Command;

  /** Argument definitions */
  arguments: ArgumentDef[] = [];

  /** Option definitions */
  options: OptionDef[] = [];

  /** Subcommands */
  commands = new Map<string, Command>();

  /** Action handler */
  action?: ActionHandler;

  /** Command middleware */
  middleware: Middleware[] = [];

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Add a subcommand
   *
   * @param name - Command name
   * @returns New command instance
   *
   * @example
   * ```typescript
   * const configCmd = cmd.addCommand('config');
   * ```
   */
  addCommand(name: string): Command {
    const command = new Command(name);
    command.parent = this;
    this.commands.set(name, command);
    return command;
  }

  /**
   * Add an argument definition
   *
   * @param def - Argument definition
   * @returns This command for chaining
   *
   * @example
   * ```typescript
   * cmd.addArgument({ name: 'input', required: true, description: 'Input file' });
   * ```
   */
  addArgument(def: ArgumentDef): this {
    this.arguments.push(def);
    return this;
  }

  /**
   * Add an option definition
   *
   * @param def - Option definition
   * @returns This command for chaining
   *
   * @example
   * ```typescript
   * cmd.addOption({ name: 'output', alias: 'o', type: 'string', default: 'dist' });
   * ```
   */
  addOption(def: OptionDef): this {
    this.options.push(def);
    return this;
  }

  /**
   * Find a subcommand by path
   *
   * @param path - Command path (e.g., ["config", "get"])
   * @returns Command or undefined
   *
   * @example
   * ```typescript
   * const configGet = rootCmd.findCommand(['config', 'get']);
   * ```
   */
  findCommand(path: string[]): Command | undefined {
    if (path.length === 0) return this;

    const [first, ...rest] = path;
    const command = this.commands.get(first);

    if (!command) return undefined;
    if (rest.length === 0) return command;

    return command.findCommand(rest);
  }

  /**
   * Check if this command has subcommands
   */
  hasChildren(): boolean {
    return this.commands.size > 0;
  }

  /**
   * Get full command path (including parent commands)
   */
  getFullName(): string {
    if (this.parent) {
      return `${this.parent.getFullName()} ${this.name}`;
    }
    return this.name;
  }

  /**
   * Find a command by name or alias
   *
   * @param name - Command name or alias
   * @returns Command or undefined
   */
  getByNameOrAlias(name: string): Command | undefined {
    // Direct match
    if (this.commands.has(name)) {
      return this.commands.get(name)!;
    }

    // Alias match
    for (const cmd of this.commands.values()) {
      if (cmd.aliases.includes(name)) {
        return cmd;
      }
    }

    return undefined;
  }

  /**
   * Get all command names including aliases
   */
  getAllNames(): Set<string> {
    const names = new Set<string>([this.name, ...this.aliases]);
    for (const cmd of this.commands.values()) {
      for (const name of cmd.getAllNames()) {
        names.add(name);
      }
    }
    return names;
  }
}
