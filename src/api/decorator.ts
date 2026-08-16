/**
 * Decorator API
 *
 * Define CLI commands declaratively on class methods using decorators.
 * Parameter metadata is captured via decorators (no `reflect-metadata`
 * required) and assembled into a CLI at runtime.
 *
 * @example
 * ```typescript
 * import { CLI, Command, Argument, Option, CLIApplication } from '@oxog/cli/decorator';
 *
 * @CLI({ name: 'myapp', version: '1.0.0' })
 * class MyApp extends CLIApplication {
 *   @Command('init', { description: 'Initialize a new project' })
 *   async init(
 *     @Argument('name') name: string,
 *     @Option('template', { alias: 't', default: 'default' }) template: string
 *   ) {
 *     console.log(`Initializing ${name} with ${template}`);
 *   }
 * }
 *
 * new MyApp().run();
 * ```
 */

import { cli } from '../cli.js';
import { buildCommandInto } from './build.js';
import type {
  ArgumentDef,
  CLI as CLIApp,
  CLIOptions,
  CLIPlugin,
  CommandDef,
  OptionDef,
} from '../types.js';

/** Per-class command metadata gathered by decorators */
interface MethodCommandMeta {
  /** Declared command name */
  name: string;
  /** Command definition fragments (description, aliases, ...) */
  def: Omit<CommandDef, 'name' | 'action' | 'arguments' | 'options' | 'commands'>;
  /** Method name on the class */
  methodName: string | symbol;
  /** Parameter metadata in declared order */
  params: ParamMeta[];
}

/** Parameter metadata for @Argument / @Option */
interface ParamMeta {
  kind: 'argument' | 'option';
  index: number;
  name: string;
  def: Omit<ArgumentDef, 'name'> | Omit<OptionDef, 'name'>;
}

/** CLI options metadata keyed by class constructor */
const cliMeta = new WeakMap<object, CLIOptions>();

/**
 * Legacy (experimental) class decorator signature.
 * Self-defined instead of using the `ClassDecorator` lib global —
 * lib decorator globals break tsup's declaration bundler.
 */
export type ClassDecoratorFn = (target: Function) => void;

/**
 * Legacy (experimental) method decorator signature.
 */
export type MethodDecoratorFn = (
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => PropertyDescriptor | void;

/**
 * Legacy (experimental) parameter decorator signature.
 */
export type ParameterDecoratorFn = (
  target: object,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => void;

/** Command metadata keyed by class prototype, then method name */
const classCommands = new WeakMap<object, Map<string | symbol, MethodCommandMeta>>();

/**
 * Parameter metadata captured before the method decorator runs.
 * Legacy TypeScript decorators evaluate parameter decorators first,
 * so @Argument/@Option record here and @Command merges on execution.
 */
const pendingParams = new WeakMap<object, Map<string | symbol, ParamMeta[]>>();

/**
 * Ensure the command map exists for a prototype.
 */
function ensureMap(target: object): Map<string | symbol, MethodCommandMeta> {
  let map = classCommands.get(target);
  if (!map) {
    map = new Map();
    classCommands.set(target, map);
  }
  return map;
}

/**
 * Record a parameter decorator hit for later merge by @Command.
 * Parameter decorators run before method decorators in legacy mode,
 * so entries may be recorded for methods that are not (yet) commands.
 */
function recordParam(target: object, key: string | symbol, param: ParamMeta): void {
  let map = pendingParams.get(target);
  if (!map) {
    map = new Map();
    pendingParams.set(target, map);
  }
  let list = map.get(key);
  if (!list) {
    list = [];
    map.set(key, list);
  }
  list.push(param);
}

/**
 * Consume pending parameter metadata for a method (one-shot).
 */
function takeParams(target: object, key: string | symbol): ParamMeta[] {
  const map = pendingParams.get(target);
  if (!map) return [];
  const list = map.get(key);
  if (!list) return [];
  map.delete(key);
  return list;
}

/**
 * Class decorator that attaches CLI application options.
 *
 * @param options - CLI options (name, version, description, plugins, ...)
 *
 * @example
 * ```typescript
 * @CLI({ name: 'myapp', version: '1.0.0', description: 'My app' })
 * class MyApp extends CLIApplication { ... }
 * ```
 */
export function CLI(options: CLIOptions): ClassDecoratorFn {
  return (target: Function): void => {
    cliMeta.set(target, options);
  };
}

/**
 * Method decorator that registers the method as a CLI command.
 *
 * @param name - Command name (defaults to the method name)
 * @param def - Command definition fragments (description, aliases, middleware)
 *
 * @example
 * ```typescript
 * @Command('build', { description: 'Build the project', aliases: ['b'] })
 * async build() { ... }
 * ```
 */
export function Command(
  name?: string,
  def: Omit<CommandDef, 'name' | 'action' | 'arguments' | 'options' | 'commands'> = {}
): MethodDecoratorFn {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const map = ensureMap(target);
    map.set(propertyKey, {
      name: name ?? String(propertyKey),
      def,
      methodName: propertyKey,
      // Merge parameter metadata recorded before this decorator ran
      params: takeParams(target, propertyKey),
    });
    return descriptor;
  };
}

/**
 * Parameter decorator that maps a positional argument to a method parameter.
 *
 * @param name - Argument name (defaults to the parameter name if known)
 * @param def - Argument definition fragments (required defaults to true)
 *
 * @example
 * ```typescript
 * @Command('greet')
 * greet(@Argument('name') name: string) { ... }
 * ```
 */
export function Argument(
  name?: string,
  def: Omit<ArgumentDef, 'name'> = {}
): ParameterDecoratorFn {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const key = propertyKey ?? '';
    const fullDef: Omit<ArgumentDef, 'name'> = { required: true, ...def };
    // Parameter decorators run before @Command; record for later merge.
    recordParam(target, key, {
      kind: 'argument',
      index: parameterIndex,
      name: name ?? `arg${parameterIndex}`,
      def: fullDef,
    });
  };
}

/**
 * Parameter decorator that maps a CLI option to a method parameter.
 *
 * @param name - Option name (without dashes)
 * @param def - Option definition fragments
 *
 * @example
 * ```typescript
 * @Command('serve')
 * serve(@Option('port', { alias: 'p', type: 'number', default: 3000 }) port: number) { ... }
 * ```
 */
export function Option(
  name?: string,
  def: Omit<OptionDef, 'name'> = {}
): ParameterDecoratorFn {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const key = propertyKey ?? '';
    // Parameter decorators run before @Command; record for later merge.
    recordParam(target, key, {
      kind: 'option',
      index: parameterIndex,
      name: name ?? `opt${parameterIndex}`,
      def,
    });
  };
}

/**
 * Assemble the CLI application from a decorated class instance.
 *
 * @param instance - Instance of a class decorated with @CLI / @Command
 * @returns Assembled CLI application
 *
 * @internal
 */
export function assemble(instance: object): CLIApp {
  const ctor = Object.getPrototypeOf(instance).constructor;
  const options = cliMeta.get(ctor) ?? { name: ctor.name };
  const app = cli(options);

  // Gather metadata from the prototype chain (supports subclass extension)
  const visited = new Set<object>();
  let proto: object | null = Object.getPrototypeOf(instance);
  while (proto && proto !== Object.prototype && proto !== CLIApplication.prototype) {
    if (!visited.has(proto)) {
      visited.add(proto);
      const map = classCommands.get(proto);
      if (map) {
        for (const meta of map.values()) {
          applyMeta(app, instance, meta);
        }
      }
    }
    proto = Object.getPrototypeOf(proto);
  }

  return app;
}

/**
 * Apply one method's command metadata onto the CLI application.
 *
 * @internal
 */
function applyMeta(app: CLIApp, instance: object, meta: MethodCommandMeta): void {
  const impl = app as unknown as {
    command(name: string): {
      _command: import('../command/command.js').Command;
    };
    commands: Map<string, unknown>;
  };

  const builder = impl.command(meta.name);
  const commandDef: CommandDef = {
    name: meta.name,
    ...meta.def,
  };

  // Arguments and options from parameter decorators, in declared order
  const params = [...meta.params].sort((a, b) => a.index - b.index);
  const args: Record<string, Omit<ArgumentDef, 'name'>> = {};
  const opts: Record<string, Omit<OptionDef, 'name'>> = {};
  for (const p of params) {
    if (p.kind === 'argument') {
      args[p.name] = p.def as Omit<ArgumentDef, 'name'>;
    } else {
      opts[p.name] = p.def as Omit<OptionDef, 'name'>;
    }
  }
  if (Object.keys(args).length > 0) commandDef.arguments = args;
  if (Object.keys(opts).length > 0) commandDef.options = opts;

  commandDef.action = async (ctx) => {
    const callArgs: unknown[] = params.map((p) =>
      p.kind === 'argument' ? ctx.args[p.name] : ctx.options[p.name]
    );
    const method = (instance as Record<string | symbol, unknown>)[meta.methodName] as (
      ...a: unknown[]
    ) => unknown;
    await method.apply(instance, callArgs);
  };

  buildCommandInto(builder._command, commandDef);
}

/**
 * Base class for decorator-based CLI applications.
 * Provides `run()` / `runAsync()` that assemble and execute the CLI.
 *
 * @example
 * ```typescript
 * @CLI({ name: 'myapp' })
 * class MyApp extends CLIApplication {
 *   @Command('hello')
 *   hello(@Argument('name') name: string) {
 *     console.log(`Hello, ${name}!`);
 *   }
 * }
 *
 * new MyApp().run();
 * ```
 */
export abstract class CLIApplication {
  /**
   * Register additional plugins before the CLI runs.
   * Override to add plugins dynamically.
   */
  protected plugins(): CLIPlugin[] {
    return [];
  }

  /**
   * Assemble the CLI application from decorator metadata.
   */
  toCLI(): CLIApp {
    const app = assemble(this);
    for (const plugin of this.plugins()) {
      app.use(plugin);
    }
    return app;
  }

  /**
   * Run the CLI application.
   *
   * @param argv - Arguments array (defaults to process.argv.slice(2))
   */
  run(argv?: string[]): void | Promise<void> {
    return this.toCLI().run(argv);
  }

  /**
   * Run the CLI application and await completion.
   *
   * @param argv - Arguments array (defaults to process.argv.slice(2))
   */
  async runAsync(argv?: string[]): Promise<void> {
    await this.toCLI().runAsync(argv);
  }
}
