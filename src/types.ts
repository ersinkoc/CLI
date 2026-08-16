// ============================================================================
// Utility types (vendored — zero-dependency)
// ============================================================================
//
// Event/utility types are single-sourced in ./events/emitter.ts and
// re-exported here to preserve the historical public surface of
// importing them from '@oxog/cli'.

// Used internally below
import type { MaybePromise, Unsubscribe, EventMap } from './events/emitter.js';

export type { MaybePromise, Unsubscribe, EventMap };

/**
 * Deep partial - all nested properties optional.
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

/**
 * Deep readonly - all nested properties readonly.
 */
export type DeepReadonly<T> = T extends object ? { readonly [P in keyof T]: DeepReadonly<T[P]> } : T;

/**
 * Deep required - all nested properties required.
 */
export type DeepRequired<T> = T extends object ? { [P in keyof T]-?: DeepRequired<T[P]> } : T;

/**
 * Make type prettier in IDE.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * Array with at least one element.
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Value that can be null.
 */
export type Nullable<T> = T | null;

/**
 * Value that can be undefined.
 */
export type Optional<T> = T | undefined;

/**
 * JSON primitive types.
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON array type.
 */
export type JsonArray = JsonValue[];

/**
 * JSON object type.
 */
export type JsonObject = { [key: string]: JsonValue };

/**
 * Any valid JSON value.
 */
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

// ============================================================================
// Event types (compatibility with @oxog/types shapes)
// ============================================================================

/**
 * Event handler for a specific event.
 */
export type EventHandler<TEvents extends EventMap, K extends keyof TEvents> = (
  payload: TEvents[K]
) => void;

/**
 * Typed event emitter interface.
 */
export interface TypedEventEmitter<TEvents extends EventMap> {
  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents, K>): Unsubscribe;
  off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents, K>): void;
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
  once<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents, K>): Unsubscribe;
}

// ============================================================================
// Plugin / Kernel compatibility types (from @oxog/types shapes)
// ============================================================================

/**
 * Standard plugin interface.
 * Compatibility alias for the former `Plugin` type from @oxog/types.
 */
export interface OxogPlugin<TContext = unknown> {
  /** Unique plugin identifier (kebab-case) */
  readonly name: string;
  /** Semantic version */
  readonly version: string;
  /** Plugin dependencies by name */
  readonly dependencies?: readonly string[];
  /** Called when plugin is registered with the kernel */
  install: (kernel: OxogKernel<TContext>) => void;
  /** Called after ALL plugins are installed */
  onInit?: (context: TContext) => MaybePromise<void>;
  /** Called when plugin is unregistered */
  onDestroy?: () => MaybePromise<void>;
  /** Called when an error occurs in this plugin */
  onError?: (error: Error) => void;
}

/**
 * Micro-kernel interface.
 * Compatibility alias for the former `Kernel` type from @oxog/types.
 */
export interface OxogKernel<TContext = unknown> {
  /** Register a plugin */
  use(plugin: OxogPlugin<TContext>): this;
  /** Unregister a plugin by name */
  unregister(name: string): boolean;
  /** Get registered plugin by name */
  getPlugin<T extends OxogPlugin<TContext> = OxogPlugin<TContext>>(name: string): T | undefined;
  /** List all registered plugins */
  listPlugins(): ReadonlyArray<OxogPlugin<TContext>>;
  /** Check if plugin is registered */
  hasPlugin(name: string): boolean;
  /** Emit event to all plugins */
  emit<K extends string>(event: K, payload?: unknown): void;
  /** Subscribe to kernel events */
  on<K extends string>(event: K, handler: (payload: unknown) => void): Unsubscribe;
  /** Get shared context */
  getContext(): TContext;
}

// ============================================================================
// Emitter type re-exports (from local zero-dependency emitter)
// ============================================================================

export type {
  EmitterOptions,
  EmitterInstance,
  Handler as EmitterHandler,
  WildcardHandler,
  PatternHandler,
} from './events/emitter.js';

// ============================================================================
// Color types (formerly re-exported from @oxog/pigment)
// ============================================================================

/**
 * Terminal color support level.
 */
export interface ColorSupport {
  /** Color depth level (0 = none, 1 = basic, 2 = 256, 3 = 16m) */
  level: 0 | 1 | 2 | 3;
  /** Basic 16 colors supported */
  hasBasic: boolean;
  /** 256 colors supported */
  has256: boolean;
  /** 16 million colors supported */
  has16m: boolean;
}

/**
 * Styler function type.
 */
export type Styler = (text: string) => string;

/**
 * Color options for the built-in chainable color API.
 */
export interface PigmentOptions {
  /** Force a color level (0-3) */
  level?: 0 | 1 | 2 | 3;
  /** Force colors on even when not a TTY */
  forceColor?: boolean;
  /** Disable colors entirely */
  noColor?: boolean;
}

/**
 * Chainable terminal styling API.
 * Property access returns a new chainable styler; calling the result
 * applies all accumulated styles to the text.
 *
 * @example
 * ```typescript
 * const pigment = createPigment();
 * pigment.red.bold('Error!');   // red + bold
 * pigment.hex('#ff6600')('Hi'); // 256-color from hex
 * ```
 */
export interface Pigment {
  readonly bold: Pigment;
  readonly dim: Pigment;
  readonly italic: Pigment;
  readonly underline: Pigment;
  readonly strikethrough: Pigment;
  readonly inverse: Pigment;
  readonly hidden: Pigment;
  readonly reset: Pigment;
  readonly black: Pigment;
  readonly red: Pigment;
  readonly green: Pigment;
  readonly yellow: Pigment;
  readonly blue: Pigment;
  readonly magenta: Pigment;
  readonly cyan: Pigment;
  readonly white: Pigment;
  readonly blackBright: Pigment;
  readonly redBright: Pigment;
  readonly greenBright: Pigment;
  readonly yellowBright: Pigment;
  readonly blueBright: Pigment;
  readonly magentaBright: Pigment;
  readonly cyanBright: Pigment;
  readonly whiteBright: Pigment;
  readonly gray: Pigment;
  readonly grey: Pigment;
  readonly bgBlack: Pigment;
  readonly bgRed: Pigment;
  readonly bgGreen: Pigment;
  readonly bgYellow: Pigment;
  readonly bgBlue: Pigment;
  readonly bgMagenta: Pigment;
  readonly bgCyan: Pigment;
  readonly bgWhite: Pigment;
  readonly bgBlackBright: Pigment;
  readonly bgRedBright: Pigment;
  readonly bgGreenBright: Pigment;
  readonly bgYellowBright: Pigment;
  readonly bgBlueBright: Pigment;
  readonly bgMagentaBright: Pigment;
  readonly bgCyanBright: Pigment;
  readonly bgWhiteBright: Pigment;
  readonly bgGray: Pigment;
  readonly bgGrey: Pigment;
  ansi256(code: number): Pigment;
  bgAnsi256(code: number): Pigment;
  rgb(r: number, g: number, b: number): Pigment;
  bgRgb(r: number, g: number, b: number): Pigment;
  hex(color: string): Pigment;
  bgHex(color: string): Pigment;
  (text: string): string;
}

// ============================================================================
// CLI-Specific Types
// ============================================================================

/**
 * CLI application options
 *
 * @example
 * ```typescript
 * // With name only
 * const options: CLIOptions = { name: 'myapp' };
 *
 * // Full options
 * const options: CLIOptions = {
 *   name: 'myapp',
 *   version: '1.0.0',
 *   description: 'My CLI application',
 *   strict: true,
 *   plugins: [helpPlugin, versionPlugin]
 * };
 * ```
 */
export interface CLIOptions {
  /** Application name (kebab-case recommended) */
  name: string;

  /** Semantic version (e.g., "1.0.0") */
  version?: string;

  /** Application description for help output */
  description?: string;

  /** Enable strict mode (fail on unknown options) */
  strict?: boolean;

  /**
   * Whether to call process.exit() on errors (default: true)
   * Set to false when using the CLI as a library to let errors propagate
   */
  exitOnError?: boolean;

  /** Custom help formatter function */
  helpFormatter?: (context: HelpContext) => string;

  /** Custom error handler function */
  errorHandler?: (error: CLIError) => never | void;

  /** Initial plugins to load */
  plugins?: CLIPlugin[];

  /**
   * Declarative command definitions (Object Config API).
   * Keyed by command name; alternative to `.command()` chaining.
   */
  commands?: Record<string, CommandDef>;

  /**
   * Declarative global option definitions (Object Config API).
   * Keyed by option name; alternative to `.option()` chaining.
   */
  options?: Record<string, Omit<OptionDef, 'name'>>;
}

/**
 * Command definition for object config API.
 * The record key under `commands` is the authoritative name.
 *
 * @example
 * ```typescript
 * const command: CommandDef = {
 *   description: 'Build the project',
 *   arguments: {
 *     input: { type: 'string', required: true, description: 'Input file' }
 *   },
 *   options: {
 *     output: { type: 'string', alias: 'o', default: 'dist' },
 *     watch: { type: 'boolean', alias: 'w' }
 *   },
 *   action: async (ctx) => {
 *     console.log(`Building ${ctx.args.input} to ${ctx.options.output}`);
 *   }
 * };
 * ```
 */
export interface CommandDef {
  /** Command name (kebab-case recommended). Optional: the record key wins. */
  name?: string;

  /** Command description for help output */
  description?: string;

  /** Alternative names for this command */
  aliases?: string[];

  /** Command arguments definition (key wins over any inner name) */
  arguments?: Record<string, Omit<ArgumentDef, 'name'>>;

  /** Command options definition (key wins over any inner name) */
  options?: Record<string, Omit<OptionDef, 'name'>>;

  /** Nested subcommands */
  commands?: Record<string, CommandDef>;

  /** Action handler function */
  action?: ActionHandler;

  /** Command-specific middleware */
  middleware?: Middleware[];
}

/**
 * Argument definition
 *
 * @example
 * ```typescript
 * const arg: ArgumentDef = {
 *   name: 'file',
 *   type: 'string',
 *   required: true,
 *   description: 'File to process',
 *   validate: (v) => v.length > 0 || 'File required'
 * };
 * ```
 */
export interface ArgumentDef {
  /** Argument name */
  name: string;

  /** Value type for coercion */
  type?: 'string' | 'number' | 'boolean';

  /** Whether argument is required */
  required?: boolean;

  /** Whether argument accepts multiple values */
  variadic?: boolean;

  /** Description for help output */
  description?: string;

  /** Default value if not provided */
  default?: unknown;

  /** Custom validation function */
  validate?: (value: unknown) => boolean | string;

  /** Custom coercion function */
  coerce?: (value: string) => unknown;
}

/**
 * Option definition
 *
 * @example
 * ```typescript
 * const opt: OptionDef = {
 *   name: 'port',
 *   alias: 'p',
 *   type: 'number',
 *   description: 'Server port',
 *   default: 3000,
 *   validate: (v) => v > 0 && v < 65536 || 'Invalid port'
 * };
 * ```
 */
export interface OptionDef {
  /** Option name (without dashes) */
  name: string;

  /** Short flag (single character) */
  alias?: string;

  /** Description for help output */
  description?: string;

  /** Value type for parsing */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';

  /** Whether option is required */
  required?: boolean;

  /** Default value if not provided */
  default?: unknown;

  /** Allowed values */
  choices?: unknown[];

  /** Custom validation function */
  validate?: (value: unknown) => boolean | string;

  /** Custom coercion function */
  coerce?: (value: string) => unknown;

  /** Whether option supports --no-xxx negation */
  negatable?: boolean;
}

/**
 * Action handler context
 * Provides access to parsed arguments, options, and utilities
 *
 * @example
 * ```typescript
 * const handler: ActionHandler = async (ctx) => {
 *   console.log('Command:', ctx.command.name);
 *   console.log('Args:', ctx.args);
 *   console.log('Options:', ctx.options);
 *
 *   if (ctx.prompt) {
 *     const answer = await ctx.prompt.input({ message: 'Continue?' });
 *   }
 * };
 * ```
 */
export interface ActionContext {
  /** Parsed arguments object */
  args: Record<string, unknown>;

  /** Parsed options object */
  options: Record<string, unknown>;

  /** Raw argv array */
  argv: string[];

  /** Current command instance */
  command: Command;

  /** CLI application instance */
  app: CLI;

  /** Prompt utilities (if prompt plugin enabled) */
  prompt?: PromptUtils;

  /** Spinner utilities (if spinner plugin enabled) */
  spinner?: SpinnerUtils;

  /** Logger utilities (if logger plugin enabled) */
  logger?: LoggerUtils;

  /** Color utilities (if color plugin enabled) - legacy API */
  color?: ColorUtils;

  /** Pigment instance (if color plugin enabled) - @oxog/pigment chainable API */
  pigment?: Pigment;

  /** Chalk-compatible API (if color plugin enabled) - from @oxog/pigment */
  chalk?: Pigment;

  /** Progress bar utilities (if progress plugin enabled) */
  progress?: ProgressUtils;

  /** Table utilities (if table plugin enabled) */
  table?: TableUtils;

  /** Config utilities (if config plugin enabled) */
  config?: ConfigUtils;

  /** Completion utilities (if completion plugin enabled) */
  completion?: CompletionUtils;
}

/**
 * Action handler function
 * Called when command is executed
 * Uses MaybePromise from @oxog/types for sync/async support
 *
 * @param ctx - Action context with args, options, and utilities
 */
export type ActionHandler = (ctx: ActionContext) => MaybePromise<void>;

/**
 * Middleware function
 * Run before command action
 * Uses MaybePromise from @oxog/types for sync/async support
 *
 * @example
 * ```typescript
 * const authMiddleware: Middleware = async (ctx, next) => {
 *   if (!ctx.options.token) {
 *     throw new CLIError('Authentication required', 'AUTH_REQUIRED');
 *   }
 *   await next();
 * };
 * ```
 */
export type Middleware = (
  ctx: ActionContext,
  next: () => MaybePromise<void>
) => MaybePromise<void>;

/**
 * Plugin interface for extending CLI kernel functionality
 * Compatible with @oxog/types Plugin interface
 *
 * @example
 * ```typescript
 * const myPlugin: CLIPlugin = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   install: (kernel) => {
 *     kernel.on('command:before', (ctx) => {
 *       console.log('Running:', ctx.command.name);
 *     });
 *   }
 * };
 *
 * cli('myapp').use(myPlugin);
 * ```
 */
export interface CLIPlugin<TContext = CLIContext> {
  /** Unique plugin identifier (kebab-case) */
  readonly name: string;

  /** Semantic version (e.g., "1.0.0") */
  readonly version: string;

  /** Other plugins this plugin depends on */
  readonly dependencies?: readonly string[];

  /**
   * Called when plugin is registered
   * @param kernel - The CLI kernel instance
   */
  install: (kernel: CLIKernel<TContext>) => void;

  /**
   * Called after all plugins are installed
   * Uses MaybePromise from @oxog/types for sync/async support
   * @param context - Shared context object
   */
  onInit?: (context: TContext) => MaybePromise<void>;

  /**
   * Called when plugin is unregistered
   * Uses MaybePromise from @oxog/types for sync/async support
   */
  onDestroy?: () => MaybePromise<void>;

  /**
   * Called on error in this plugin
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;
}

/**
 * CLI context type for plugins
 */
export interface CLIContext {
  [key: string]: unknown;
}

/**
 * CLI kernel interface
 * Core orchestration and plugin management
 * Compatible with @oxog/types Kernel interface
 */
export interface CLIKernel<TContext = CLIContext> {
  /**
   * Register a plugin
   * @param plugin - Plugin to register
   */
  register(plugin: CLIPlugin<TContext>): void;

  /**
   * Unregister a plugin by name
   * @param name - Plugin name to unregister
   */
  unregister(name: string): void;

  /**
   * List all registered plugins
   */
  list(): CLIPlugin<TContext>[];

  /**
   * Check if plugin is registered
   * @param name - Plugin name
   */
  has(name: string): boolean;

  /**
   * Get a plugin by name
   * @param name - Plugin name
   */
  get(name: string): CLIPlugin<TContext> | undefined;

  /**
   * Emit an event
   * Uses @oxog/emitter internally
   * @param event - Event name
   * @param data - Event data
   */
  emit(event: string, data: unknown): MaybePromise<void>;

  /**
   * Register event listener
   * Returns Unsubscribe function from @oxog/types
   * @param event - Event name
   * @param handler - Event handler
   */
  on(event: string, handler: (...args: unknown[]) => MaybePromise<void>): Unsubscribe;

  /**
   * Unregister event listener
   * @param event - Event name
   * @param handler - Event handler
   */
  off(event: string, handler?: (...args: unknown[]) => MaybePromise<void>): void;

  /**
   * Get shared context
   */
  getContext(): Readonly<TContext>;
}

/**
 * CLI application class interface
 */
export interface CLI {
  /** Application name */
  readonly name: string;

  /** Command registry */
  readonly commands: Map<string, Command>;

  /** Global options */
  readonly options: OptionDef[];

  /** Registered plugins */
  readonly plugins: Set<string>;

  /**
   * Set version
   * @param v - Semantic version
   */
  setVersion(v: string): this;

  /**
   * Get or set version (fluent API)
   * @param v - Semantic version (optional)
   */
  version(): string;
  version(v: string): this;

  /**
   * Set description
   * @param description - Application description
   */
  describe(description: string): this;

  /**
   * Get or set description (fluent API)
   * @param description - Application description (optional)
   */
  description(): string;
  description(description: string): this;

  /**
   * Add a command
   * @param name - Command name
   */
  command(name: string): CommandBuilder;

  /**
   * Add a global option
   * @param flags - Option flags (e.g., "-v, --verbose")
   * @param description - Option description
   * @param options - Option definition
   */
  option(flags: string, description?: string, options?: Partial<OptionDef>): this;

  /**
   * Register a plugin
   * @param plugin - Plugin to register
   */
  use(plugin: CLIPlugin): this;

  /**
   * Run the CLI
   * @param argv - Arguments array (defaults to process.argv.slice(2))
   */
  run(argv?: string[]): void | Promise<void>;

  /**
   * Run the CLI and await completion
   * @param argv - Arguments array (defaults to process.argv.slice(2))
   */
  runAsync(argv?: string[]): Promise<void>;
}

/**
 * Command class interface
 */
export interface Command {
  /** Command name */
  readonly name: string;

  /** Command description */
  description: string;

  /** Command aliases */
  aliases: string[];

  /** Parent command (if nested) */
  parent?: Command;

  /** Argument definitions */
  arguments: ArgumentDef[];

  /** Option definitions */
  options: OptionDef[];

  /** Subcommands */
  commands: Map<string, Command>;

  /** Action handler */
  action?: ActionHandler;

  /** Command middleware */
  middleware: Middleware[];

  /**
   * Add a subcommand
   * @param name - Command name
   */
  addCommand(name: string): Command;

  /**
   * Find a command by path
   * @param path - Command path (e.g., ["config", "get"])
   */
  findCommand(path: string[]): Command | undefined;
}

/**
 * Command builder interface for fluent API
 */
export interface CommandBuilder {
  /**
   * Set description
   * @param description - Command description
   */
  description(description: string): this;

  /**
   * Set description (alias for description)
   * @param description - Command description
   */
  describe(description: string): this;

  /**
   * Add an argument
   * @param def - Argument definition (e.g., "<name>" or "[file]")
   * @param description - Argument description
   */
  argument(def: string, description?: string): this;

  /**
   * Add an option
   * @param flags - Option flags (e.g., "-o, --output <file>")
   * @param description - Option description
   * @param options - Additional options
   */
  option(flags: string, description?: string, options?: Partial<OptionDef>): this;

  /**
   * Add an alias
   * @param aliases - One or more aliases
   */
  alias(...aliases: string[]): this;

  /**
   * Set action handler
   * @param handler - Action handler function
   */
  action(handler: ActionHandler): this;

  /**
   * Add middleware
   * @param middleware - Middleware function
   */
  use(middleware: Middleware): this;

  /**
   * Add a subcommand
   * @param name - Command name
   */
  addCommand(name: string): CommandBuilder;

  /**
   * Navigate to parent command
   */
  parent(): CLI;
}

/**
 * Prompt utilities interface
 */
export interface PromptUtils {
  input(options: PromptInputOptions): Promise<string>;
  password(options: PromptInputOptions): Promise<string>;
  confirm(options: PromptConfirmOptions): Promise<boolean>;
  select<T>(options: PromptSelectOptions<T>): Promise<T>;
  multiselect<T>(options: PromptMultiSelectOptions<T>): Promise<T[]>;
  autocomplete<T>(options: PromptAutocompleteOptions<T>): Promise<T>;
  number(options: PromptNumberOptions): Promise<number>;
  date(options: PromptDateOptions): Promise<Date>;
  editor(options: PromptEditorOptions): Promise<string>;
  wizard<T>(options: PromptWizardOptions<T>): Promise<T>;
}

/**
 * Spinner utilities interface
 */
export interface SpinnerUtils {
  start(text: string): Spinner;
}

/**
 * Logger utilities interface
 */
export interface LoggerUtils {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Spinner interface
 */
export interface Spinner {
  /** Current spinner text */
  text: string;
  /** Update spinner text */
  update(text: string): void;
  /** Mark as succeeded */
  succeed(text?: string): void;
  /** Mark as failed */
  fail(text?: string): void;
  /** Mark with warning */
  warn(text?: string): void;
  /** Mark with info */
  info(text?: string): void;
}

/**
 * CLI Error class
 */
export declare class CLIError extends Error {
  /** Error code */
  code: string;
  /** Exit code */
  exitCode: number;

  constructor(message: string, code: string, exitCode?: number);
}

/**
 * Help context
 */
export interface HelpContext {
  app: CLI;
  command?: Command;
  argv: string[];
}

/**
 * Prompt options
 */
export interface PromptInputOptions {
  message: string;
  default?: string;
  validate?: (value: string) => boolean | string;
}

export interface PromptConfirmOptions {
  message: string;
  default?: boolean;
}

export interface PromptSelectOption<T> {
  value: T;
  label: string;
  hint?: string;
}

export interface PromptSelectOptions<T> {
  message: string;
  choices: Array<string | PromptSelectOption<T>>;
  default?: T;
}

export interface PromptMultiSelectOptions<T> {
  message: string;
  choices: Array<string | PromptSelectOption<T>>;
  min?: number;
  max?: number;
  required?: boolean;
}

export interface PromptAutocompleteOptions<T> {
  message: string;
  choices: T[];
  limit?: number;
}

export interface PromptNumberOptions {
  message: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number;
}

export interface PromptDateOptions {
  message: string;
  format?: string;
  min?: Date;
  max?: Date;
}

export interface PromptEditorOptions {
  message: string;
  default?: string;
  extension?: string;
}

export interface PromptWizardOptions<T> {
  steps: Array<{
    name: string;
    prompt: unknown;
    when?: (answers: T) => boolean;
  }>;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Event data for command:before event
 */
export interface CommandBeforeEvent {
  /** The command being executed */
  command: Command;
  /** The action context */
  context: ActionContext;
}

/**
 * Event data for command:after event
 */
export interface CommandAfterEvent {
  /** The command that was executed */
  command: Command;
  /** The action context */
  context: ActionContext;
  /** Result from the action (if any) */
  result?: unknown;
}

/**
 * Event data for help event
 */
export interface HelpEvent {
  /** The CLI application */
  app: CLI;
  /** The command to show help for (if any) */
  command?: Command;
  /** Raw argv array */
  argv?: string[];
}

/**
 * Event data for version event
 */
export interface VersionEvent {
  /** Version string */
  version: string;
}

/**
 * Event data for error event
 */
export interface ErrorEvent {
  /** The error that occurred */
  error: Error;
  /** The command being executed (if any) */
  command?: Command;
  /** The action context (if any) */
  context?: ActionContext;
}

/**
 * All event types mapped by event name
 * Extends EventMap from @oxog/types for type-safe event handling
 */
export interface CLIEvents extends EventMap {
  'command:before': CommandBeforeEvent;
  'command:after': CommandAfterEvent;
  'help': HelpEvent;
  'version': VersionEvent;
  'error': ErrorEvent;
}

/**
 * Typed event handler
 * Uses MaybePromise from @oxog/types for sync/async support
 */
export type TypedEventHandler<T> = (data: T) => MaybePromise<void>;

// ============================================================================
// Progress Bar Types
// ============================================================================

// ============================================================================
// Color Types
// ============================================================================

/**
 * Color function type
 */
export type ColorFn = (text: string) => string;

/**
 * Color utilities interface
 * Provides ANSI color functions for terminal output
 */
export interface ColorUtils {
  /** Black text */
  black: ColorFn;
  /** Red text */
  red: ColorFn;
  /** Green text */
  green: ColorFn;
  /** Yellow text */
  yellow: ColorFn;
  /** Blue text */
  blue: ColorFn;
  /** Magenta text */
  magenta: ColorFn;
  /** Cyan text */
  cyan: ColorFn;
  /** White text */
  white: ColorFn;
  /** Gray text */
  gray: ColorFn;

  /** Black background */
  bgBlack: ColorFn;
  /** Red background */
  bgRed: ColorFn;
  /** Green background */
  bgGreen: ColorFn;
  /** Yellow background */
  bgYellow: ColorFn;
  /** Blue background */
  bgBlue: ColorFn;
  /** Magenta background */
  bgMagenta: ColorFn;
  /** Cyan background */
  bgCyan: ColorFn;
  /** White background */
  bgWhite: ColorFn;

  /** Hex color function */
  hex: (hexColor: string, text: string) => string;
  /** RGB color function */
  rgb: (r: number, g: number, b: number, text: string) => string;

  /** Bold text */
  bold: ColorFn;
  /** Dim text */
  dim: ColorFn;
  /** Italic text */
  italic: ColorFn;
  /** Underlined text */
  underline: ColorFn;
}

// ============================================================================
// Progress Types
// ============================================================================

/**
 * Progress bar interface
 */
export interface ProgressBar {
  /** Current value */
  current: number;
  /** Total value */
  total: number;
  /** Update progress */
  update(value: number): void;
  /** Increment progress */
  increment(delta?: number): void;
  /** Set total */
  setTotal(total: number): void;
  /** Stop the progress bar */
  stop(): void;
  /** Mark as complete */
  complete(): void;
}

/**
 * Progress bar options
 */
export interface ProgressBarOptions {
  /** Total value */
  total: number;
  /** Initial value */
  current?: number;
  /** Bar width (characters) */
  width?: number;
  /** Completed character */
  completeChar?: string;
  /** Incomplete character */
  incompleteChar?: string;
  /** Show percentage */
  showPercentage?: boolean;
  /** Show ETA */
  showETA?: boolean;
  /** Custom format string */
  format?: string;
}

/**
 * Progress utilities interface
 */
export interface ProgressUtils {
  /** Create a single progress bar */
  create(options: ProgressBarOptions): ProgressBar;
}

// ============================================================================
// Table Types
// ============================================================================

/**
 * Table border styles
 */
export type TableBorderStyle = 'none' | 'single' | 'double' | 'rounded' | 'heavy' | 'ascii';

/**
 * Table alignment
 */
export type TableAlignment = 'left' | 'center' | 'right';

/**
 * Table column definition
 */
export interface TableColumnDef {
  /** Column key in data */
  key: string;
  /** Column header */
  header?: string;
  /** Column width (characters) */
  width?: number;
  /** Text alignment */
  align?: TableAlignment;
  /** Format function */
  format?: (value: unknown, row: Record<string, unknown>) => string;
}

/**
 * Table options
 */
export interface TableOptions {
  /** Column definitions */
  columns?: Array<string | TableColumnDef>;
  /** Show header row */
  header?: boolean;
  /** Border style */
  border?: TableBorderStyle;
  /** Padding inside cells */
  padding?: number;
}

/**
 * Table utilities interface
 */
export interface TableUtils {
  /** Render data as table string */
  render(data: Array<Record<string, unknown>>, options?: TableOptions): string;
  /** Print data as table */
  print(data: Array<Record<string, unknown>>, options?: TableOptions): void;
}

// ============================================================================
// Config Types
// ============================================================================

/**
 * Config utilities interface
 */
export interface ConfigUtils {
  /** Loaded configuration */
  config: Record<string, unknown>;
  /** Path to config file */
  filePath?: string;
  /** Get a config value by path */
  get<T = unknown>(path: string, defaultValue?: T): T;
  /** Reload configuration */
  reload(): Promise<void>;
}

// ============================================================================
// Completion Types
// ============================================================================

/**
 * Shell types for completion
 */
export type ShellType = 'bash' | 'zsh' | 'fish';

/**
 * Completion utilities interface
 */
export interface CompletionUtils {
  /** Generate completion script for a shell */
  generate(shell?: ShellType): string;
  /** Get installation instructions */
  instructions(shell?: ShellType): string;
  /** Detect current shell */
  detectShell(): ShellType;
}
