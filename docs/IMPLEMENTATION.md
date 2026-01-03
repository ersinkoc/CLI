# @oxog/cli - Implementation Architecture

## Version: 1.0.0
## Status: Final Architecture
## Author: Ersin Koç

---

## 1. Architecture Overview

### 1.1 Design Philosophy

The @oxog/cli framework is built on these principles:

1. **Micro-Kernel Pattern**: Minimal core with plugin extensibility
2. **Zero Dependencies**: Every feature implemented from scratch
3. **Type Safety**: Full TypeScript with strict mode
4. **Performance**: Fast startup, minimal overhead
5. **Developer Experience**: Three API styles, rich errors, great docs

### 1.2 Architectural Layers

```
┌──────────────────────────────────────────────────────────────┐
│                    API Layer                                  │
│   (Fluent Builder | Object Config | Decorator-based)         │
├──────────────────────────────────────────────────────────────┤
│                    Facade Layer                               │
│              (CLI Class - Entry Point)                       │
├──────────────────────────────────────────────────────────────┤
│                   Domain Layer                                │
│   Command Registry | Parser | Router | Plugin Manager        │
├──────────────────────────────────────────────────────────────┤
│                   Kernel Layer                                │
│   Event Bus | Error Boundary | Config Manager                │
├──────────────────────────────────────────────────────────────┤
│                  Plugin Layer                                 │
│   Core Plugins | Optional Plugins | Community Plugins        │
├──────────────────────────────────────────────────────────────┤
│                  Utility Layer                                │
│   ANSI | Terminal | Fuzzy Search | Levenshtein               │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Module Architecture

### 2.1 File Structure Decision

```
src/
├── index.ts                    # Main export barrel
├── cli.ts                      # CLI class (fluent builder facade)
├── kernel.ts                   # Micro kernel core
├── types.ts                    # All TypeScript types
├── parser/                     # Argument parsing
│   ├── index.ts
│   ├── tokenizer.ts            # Tokenize argv
│   ├── arguments.ts            # Parse positional args
│   └── options.ts              # Parse options
├── command/                    # Command system
│   ├── index.ts
│   ├── command.ts              # Command class
│   ├── registry.ts             # Command registry
│   └── router.ts               # Command router
├── api/                        # API styles
│   ├── index.ts
│   ├── fluent.ts               # Fluent builder
│   ├── config.ts               # Object config
│   └── decorators.ts           # Decorator-based
├── plugins/                    # Plugin system
│   ├── index.ts
│   ├── core/                   # Core plugins
│   └── optional/               # Optional plugins
├── utils/                      # Utilities
├── errors/                     # Error handling
└── events/                     # Event system
```

**Rationale**: Separation of concerns with clear boundaries. Each module has a single responsibility.

---

## 3. Core Components

### 3.1 CLI Class (Facade)

**Purpose**: Main entry point, provides fluent builder API

**Responsibilities**:
- Create and configure CLI instance
- Register commands and options
- Load plugins
- Execute CLI

**Key Methods**:
```typescript
class CLI {
  constructor(options: CLIOptions)
  version(v: string): this
  description(d: string): this
  command(name: string): CommandBuilder
  option(flags: string, desc?: string, opts?: OptionDef): this
  use(plugin: CLIPlugin): this
  run(argv?: string[]): void | Promise<void>
}
```

**Design Pattern**: Facade + Builder

### 3.2 Micro Kernel

**Purpose**: Core orchestration, plugin lifecycle

**Responsibilities**:
- Plugin registration and lifecycle
- Event bus management
- Error boundary
- Configuration management

**Key Methods**:
```typescript
class CLIKernel {
  register(plugin: CLIPlugin): void
  unregister(name: string): void
  emit(event: string, data: unknown): void
  on(event: string, handler: Function): void
  getConfig(): Readonly<Config>
  setErrorHandler(handler: ErrorHandler): void
}
```

**Design Pattern**: Micro-kernel + Event-driven

### 3.3 Parser Module

**Purpose**: Parse argv into structured data

**Components**:

#### Tokenizer
```typescript
class Tokenizer {
  tokenize(argv: string[]): Token[]
}

// Tokens: { type: 'option'|'argument'|'flag', value: string, raw: string }
```

**Algorithm**:
1. Split on spaces (respecting quotes)
2. Identify option prefixes (-, --)
3. Handle option values (--opt value, --opt=value)
4. Handle flag groups (-xyz = -x -y -z)

#### Argument Parser
```typescript
class ArgumentParser {
  parse(tokens: Token[], defs: ArgumentDef[]): ParsedArguments
}
```

**Algorithm**:
1. Match tokens to argument definitions
2. Validate required arguments
3. Handle variadic arguments
4. Apply default values

#### Option Parser
```typescript
class OptionParser {
  parse(tokens: Token[], defs: OptionDef[]): ParsedOptions
}
```

**Algorithm**:
1. Extract options from tokens
2. Handle short and long forms
3. Parse values with type coercion
4. Handle negatable options
5. Validate choices and custom validators

### 3.4 Command System

#### Command Class
```typescript
class Command {
  name: string
  description?: string
  aliases: string[]
  arguments: ArgumentDef[]
  options: OptionDef[]
  commands: Map<string, Command>
  parent?: Command
  action?: ActionHandler
  middleware: Middleware[]

  addCommand(def: CommandDef): Command
  findCommand(path: string[]): Command | null
  execute(ctx: ActionContext): Promise<void>
}
```

#### Command Registry
```typescript
class CommandRegistry {
  register(command: Command): void
  unregister(name: string): void
  get(name: string): Command | undefined
  list(): Command[]
  find(name: string): Command | null  // With fuzzy search
}
```

#### Command Router
```typescript
class CommandRouter {
  route(argv: string[]): RouteResult
}

interface RouteResult {
  command: Command
  args: ParsedArguments
  options: ParsedOptions
  unknown: string[]
}
```

**Routing Algorithm**:
1. Tokenize argv
2. Match command path (handling aliases)
3. Parse arguments and options
4. Validate results
5. Return route or error

---

## 4. Plugin System

### 4.1 Plugin Interface

```typescript
interface CLIPlugin<TContext = CLIContext> {
  name: string;
  version: string;
  dependencies?: string[];
  install(kernel: CLIKernel<TContext>): void;
  onInit?(context: TContext): void | Promise<void>;
  onDestroy?(): void | Promise<void>;
  onError?(error: Error): void;
}
```

### 4.2 Plugin Lifecycle

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ install │ -> │ onInit  │ -> │  Use    │ -> │destroy  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     ↓              ↓              ↓              ↓
 Register       Initialize     Execute      Cleanup
 hooks          context       features      resources
```

### 4.3 Plugin Communication

**Event Bus Pattern**:
```typescript
kernel.on('command:before', (ctx) => { /* ... */ });
kernel.on('command:after', (ctx) => { /* ... */ });
kernel.on('error', (err) => { /* ... */ });
kernel.emit('custom:event', data);
```

### 4.4 Plugin Organization

```
plugins/
├── core/                   # Always loaded
│   ├── help.ts            # Auto-generated help
│   ├── version.ts         # --version flag
│   └── validation.ts      # Type validation
└── optional/              # Opt-in via .use()
    ├── prompt/            # Interactive prompts
    ├── spinner/           # Loading spinners
    ├── color/             # ANSI colors
    ├── table/             # Table formatting
    ├── config/            # Config files
    ├── completion/        # Shell completion
    ├── update-notifier/   # Update checker
    ├── logger/            # Leveled logging
    └── middleware/        # Command middleware
```

---

## 5. API Styles Implementation

### 5.1 Fluent Builder (Primary)

**Pattern**: Method chaining

```typescript
function cli(nameOrOptions: string | CLIOptions): CLI {
  return new CLI(typeof nameOrOptions === 'string'
    ? { name: nameOrOptions }
    : nameOrOptions
  );
}

class CLI {
  version(v: string): this {
    this._version = v;
    return this;
  }

  command(name: string): CommandBuilder {
    const builder = new CommandBuilder(name);
    this._commands.set(name, builder);
    return builder;
  }
}
```

### 5.2 Object Config

**Pattern**: Configuration object

```typescript
function cli(config: CLIConfig): CLI {
  const app = new CLI({ name: config.name });

  if (config.version) app.version(config.version);
  if (config.description) app.description(config.description);

  for (const [name, def] of Object.entries(config.commands || {})) {
    app.command(name).fromConfig(def);
  }

  return app;
}
```

### 5.3 Decorator API

**Pattern**: Class decorators + parameter decorators

```typescript
function CLI(config: CLIOptions) {
  return function<T extends { run(): void }>(target: new () => T) {
    return class extends target {
      constructor() {
        super();
        const app = cli(config);
        (app as any)._decoratorInstance = this;
        app.run();
      }
    };
  };
}

function Command(name: string, options?: CommandOptions) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Store command metadata
    const commands = Reflect.getMetadata('commands', target.constructor) || [];
    commands.push({ name, method: propertyKey, options });
    Reflect.defineMetadata('commands', commands, target.constructor);
  };
}
```

---

## 6. Type System Design

### 6.1 Type Inference Strategy

**Goal**: End-to-end type safety from command definition to action handler

**Approach**:
1. Use generic types to track defined args/options
2. Build typed context from command definition
3. Infer action handler parameters

```typescript
type CommandContext<TArgs, TOpts> = {
  args: TArgs;
  options: TOpts;
  // ...
};

interface CommandBuilder<TArgs = {}, TOpts = {}> {
  argument<K extends string, V>(
    name: K,
    description: string,
    type?: V
  ): CommandBuilder<TArgs & Record<K, V>, TOpts>;

  action(
    handler: (ctx: CommandContext<TArgs, TOpts>) => void
  ): this;
}
```

### 6.2 Type Coercion

**Types and Coercion Functions**:
```typescript
type Coercer = (value: string) => unknown;

const coercers: Record<string, Coercer> = {
  string: (v) => v,
  number: (v) => Number(v),
  boolean: (v) => v !== 'false' && v !== '0',
  array: (v) => v.split(','),
  object: (v) => {
    const [key, ...rest] = v.split('=');
    return { [key]: rest.join('=') };
  }
};
```

### 6.3 Validation

**Validation Strategy**:
1. Built-in type validation
2. Choice validation
3. Custom validators
4. Required field validation

```typescript
function validate(value: unknown, def: ArgumentDef | OptionDef): string | null {
  // Required check
  if (def.required && value === undefined) {
    return `${def.name} is required`;
  }

  // Choice validation
  if (def.choices && !def.choices.includes(value)) {
    return `${def.name} must be one of: ${def.choices.join(', ')}`;
  }

  // Custom validation
  if (def.validate) {
    const result = def.validate(value);
    if (result !== true) return result as string;
  }

  return null;
}
```

---

## 7. Error Handling Strategy

### 7.1 Error Classes

```typescript
class CLIError extends Error {
  code: string;
  exitCode: number;

  constructor(message: string, code: string, exitCode = 1) {
    super(message);
    this.name = 'CLIError';
    this.code = code;
    this.exitCode = exitCode;
  }
}

// Specific errors
class UnknownCommandError extends CLIError { /* ... */ }
class MissingArgumentError extends CLIError { /* ... */ }
class InvalidOptionError extends CLIError { /* ... */ }
class ValidationError extends CLIError { /* ... */ }
```

### 7.2 Error Handler

```typescript
interface ErrorHandler {
  (error: CLIError, context: ErrorContext): void | never;
}

// Default handler
function defaultErrorHandler(error: CLIError): never {
  console.error(color.red(`Error: ${error.message}`));

  if (error.code === 'UNKNOWN_COMMAND') {
    const suggestion = findSimilarCommand(error.command);
    if (suggestion) {
      console.error(`\nDid you mean "${suggestion}"?`);
    }
  }

  process.exit(error.exitCode);
}
```

### 7.3 Error Boundary

```typescript
class ErrorBoundary {
  private handlers: Map<string, (error: Error) => void> = new Map();

  catch(error: Error, context?: string): void {
    // Try specific handler
    const handler = this.handlers.get(context || '');
    if (handler) {
      handler(error);
      return;
    }

    // Emit to kernel
    kernel.emit('error', error);

    // Default handler
    defaultErrorHandler(error);
  }
}
```

---

## 8. ANSI/Terminal Implementation

### 8.1 ANSI Codes

**Implemented from scratch**:

```typescript
const ANSI = {
  // Colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  // ...

  // Styles
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Cursor
  cursorUp: (n) => `\x1b[${n}A`,
  cursorDown: (n) => `\x1b[${n}B`,
  cursorLeft: (n) => `\x1b[${n}D`,
  cursorRight: (n) => `\x1b[${n}C`,
  clearLine: '\x1b[2K',
  clearScreen: '\x1b[2J',

  // Detection
  isSupported: () => {
    if (process.env.NO_COLOR) return false;
    if (process.env.FORCE_COLOR) return true;
    return process.stdout.isTTY;
  }
};
```

### 8.2 Color Utility

```typescript
function colorize(text: string, code: string): string {
  if (!ANSI.isSupported()) return text;
  return `${code}${text}${ANSI.reset}`;
}

const color = {
  red: (text: string) => colorize(text, ANSI.red),
  green: (text: string) => colorize(text, ANSI.green),
  // ... with chaining support
};
```

### 8.3 Terminal Utilities

```typescript
const terminal = {
  get width(): number {
    return process.stdout.columns || 80;
  },

  get height(): number {
    return process.stdout.rows || 24;
  },

  clear(): void {
    process.stdout.write(ANSI.clearScreen);
  }
};
```

---

## 9. Prompt Implementation

### 9.1 Base Prompt Class

```typescript
abstract class Prompt<T> {
  abstract render(): Promise<T>;

  protected readline: readline.Interface = createInterface({
    input: process.stdin,
    output: process.stdout
  });
}
```

### 9.2 Input Prompt

```typescript
class InputPrompt extends Prompt<string> {
  async render(): Promise<string> {
    process.stdout.write(this.message);

    for await (const line of this.readline) {
      // Validate
      if (this.validate) {
        const result = this.validate(line);
        if (result !== true) {
          process.stdout.write(color.red(result + '\n'));
          process.stdout.write(this.message);
          continue;
        }
      }

      this.readline.close();
      return line || this.default;
    }
  }
}
```

### 9.3 Select Prompt

**Algorithm**:
1. Render choices with cursor
2. Listen for keypress (up/down/enter)
3. Update cursor position
4. On enter, return selected value

```typescript
class SelectPrompt extends Prompt<string> {
  private selectedIndex = 0;

  async render(): Promise<string> {
    // Hide cursor
    process.stdout.write(ANSI.hideCursor);

    // Render initial
    this.renderChoices();

    // Listen for input
    const keypress = await this.listenForKeypress();

    if (keypress.name === 'up') {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    } else if (keypress.name === 'down') {
      this.selectedIndex = Math.min(this.choices.length - 1, this.selectedIndex + 1);
    } else if (keypress.name === 'return') {
      process.stdout.write(ANSI.showCursor);
      return this.choices[this.selectedIndex].value;
    }

    // Re-render and loop
    return this.render();
  }

  private renderChoices(): void {
    // Clear and re-render
    process.stdout.write(ANSI.cursorUp(this.choices.length));

    this.choices.forEach((choice, i) => {
      const prefix = i === this.selectedIndex
        ? color.cyan('› ')
        : '  ';
      const label = i === this.selectedIndex
        ? color.bold(choice.label)
        : choice.label;

      process.stdout.write(`${prefix}${label}\n`);
    });
  }
}
```

---

## 10. Spinner Implementation

### 10.1 Spinner Frames

```typescript
const spinnerFrames = [
  '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'
];

const spinnerSuccess = '✔';
const spinnerFail = '✖';
const spinnerWarn = '⚠';
```

### 10.2 Spinner Class

```typescript
class Spinner {
  private frameIndex = 0;
  private interval?: NodeJS.Timeout;
  private text = '';

  start(text: string): this {
    this.text = text;

    this.interval = setInterval(() => {
      const frame = spinnerFrames[this.frameIndex];
      process.stdout.write(`\r${frame} ${this.text}`);
      this.frameIndex = (this.frameIndex + 1) % spinnerFrames.length;
    }, 80);

    return this;
  }

  succeed(text?: string): void {
    this.stop();
    console.log(`\r${color.green(spinnerSuccess)} ${text || this.text}`);
  }

  fail(text?: string): void {
    this.stop();
    console.log(`\r${color.red(spinnerFail)} ${text || this.text}`);
  }

  private stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
```

---

## 11. Progress Bar Implementation

```typescript
class ProgressBar {
  private current = 0;
  private readonly total: number;
  private readonly width: number;

  constructor(options: ProgressBarOptions) {
    this.total = options.total;
    this.width = Math.min(50, terminal.width - 20);
  }

  update(value: number): void {
    this.current = Math.min(value, this.total);
    this.render();
  }

  increment(amount = 1): void {
    this.update(this.current + amount);
  }

  private render(): void {
    const percentage = Math.floor((this.current / this.total) * 100);
    const filled = Math.floor((this.current / this.total) * this.width);
    const empty = this.width - filled;

    const bar = color.green('█'.repeat(filled)) + '░'.repeat(empty);
    const text = `\r${bar} ${percentage}% | ${this.current}/${this.total}`;

    process.stdout.write(text);
  }

  stop(): void {
    process.stdout.write('\n');
  }
}
```

---

## 12. Table Implementation

### 12.1 Table Measurement

```typescript
interface ColumnMetrics {
  width: number;
  align: 'left' | 'center' | 'right';
}

function measureColumns(data: Record<string, unknown>[], columns: string[]): ColumnMetrics[] {
  return columns.map(col => {
    const maxWidth = Math.max(
      col.length,
      ...data.map(row => String(row[col] ?? '').length)
    );
    return { width: maxWidth + 2, align: 'left' };
  });
}
```

### 12.2 Table Rendering

```typescript
function renderTable(
  data: Record<string, unknown>[],
  options: TableOptions
): string {
  const metrics = measureColumns(data, options.columns);
  const lines: string[] = [];

  // Header
  if (options.header) {
    lines.push(renderRow(options.columns, metrics));
    lines.push(renderSeparator(metrics));
  }

  // Data
  for (const row of data) {
    lines.push(renderRow(
      options.columns.map(col => String(row[col] ?? '')),
      metrics
    ));
  }

  return lines.join('\n');
}
```

---

## 13. Config File Implementation

### 13.1 Config Search Strategy

```typescript
async function loadConfig(options: ConfigOptions): Promise<Config> {
  // 1. Try search places in order
  for (const place of options.searchPlaces) {
    const path = join(process.cwd(), place);
    if (await exists(path)) {
      const config = await parseConfig(path);
      return { ...options.defaults, ...config };
    }
  }

  // 2. Try package.json
  const pkgPath = join(process.cwd(), 'package.json');
  if (await exists(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
    if (pkg[options.name]) {
      return { ...options.defaults, ...pkg[options.name] };
    }
  }

  // 3. Return defaults
  return options.defaults;
}
```

### 13.2 Parser Implementation

```typescript
async function parseConfig(path: string): Promise<Record<string, unknown>> {
  const ext = extname(path);
  const content = await readFile(path, 'utf-8');

  switch (ext) {
    case '.json':
      return JSON.parse(content);

    case '.js':
      // Dynamic import for .js config
      return (await import(url.pathToFileURL(path).href)).default;

    case '.yaml':
    case '.yml':
      return parseYAML(content); // Implement YAML parser

    case '.toml':
      return parseTOML(content); // Implement TOML parser

    default:
      return {};
  }
}
```

**Note**: YAML and TOML parsers implemented from scratch.

---

## 14. Shell Completion

### 14.1 Completion Data Extraction

```typescript
function extractCompletionData(app: CLI): CompletionData {
  return {
    name: app.name,
    commands: Array.from(app.commands.values()).map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      aliases: cmd.aliases,
      options: cmd.options.map(opt => ({
        flags: formatFlags(opt),
        description: opt.description
      }))
    }))
  };
}
```

### 14.2 Bash Completion

```bash
# Template
_{app_name}() {
  local cur prev commands
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  commands="{generate_command_list}"

  if [[ ${cur} == * ]] ; then
    COMPREPLY=( $(compgen -W "${commands}" -- ${cur}) )
    return 0
  fi
}
complete -F _{app_name} {app_name}
```

### 14.3 Zsh Completion

```zsh
#compdef {app_name}
_{app_name}() {
  local -a commands
  commands=(
    {generate_command_list}
  )

  if (( CURRENT == 2 )); then
    _describe 'command' commands
  fi
}
```

---

## 15. Testing Strategy

### 15.1 Test Structure

```
tests/
├── unit/
│   ├── parser/
│   │   ├── tokenizer.test.ts
│   │   ├── arguments.test.ts
│   │   └── options.test.ts
│   ├── command/
│   │   ├── command.test.ts
│   │   ├── registry.test.ts
│   │   └── router.test.ts
│   ├── plugins/
│   │   ├── core/
│   │   └── optional/
│   └── utils/
│       ├── ansi.test.ts
│       ├── fuzzy.test.ts
│       └── levenshtein.test.ts
├── integration/
│   ├── fluent-api.test.ts
│   ├── config-api.test.ts
│   └── decorator-api.test.ts
└── fixtures/
```

### 15.2 Test Utilities

```typescript
// Mock stdin for prompts
export function mockInput(input: string): void {
  // Stub process.stdin
}

// Capture stdout
export function captureOutput(): string {
  let output = '';
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };
  return output;
}

// Create test CLI
export function createTestCLI(): CLI {
  return cli('test').version('1.0.0');
}
```

---

## 16. Performance Optimizations

### 16.1 Lazy Loading

Plugins loaded only when used:

```typescript
class CLI {
  private loadedPlugins = new Set<string>();

  use(plugin: CLIPlugin): this {
    this.kernel.register(plugin);

    if (!this.loadedPlugins.has(plugin.name)) {
      plugin.install(this.kernel);
      this.loadedPlugins.add(plugin.name);
    }

    return this;
  }
}
```

### 16.2 Caching

```typescript
// Cache parsed config
let cachedConfig: Config | null = null;

export async function getConfig(): Promise<Config> {
  if (cachedConfig) return cachedConfig;
  cachedConfig = await loadConfig();
  return cachedConfig;
}
```

---

## 17. Build Configuration

### 17.1 tsup Config

```typescript
export default defineConfig({
  entry: ['src/index.ts', 'src/plugins/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false, // Keep readable for debugging
  target: 'es2022'
});
```

### 17.2 Package Exports

```json
{
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  }
}
```

---

## 18. Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Zero dependencies | Full control, minimal bundle | Initial |
| Micro-kernel architecture | Extensibility, separation of concerns | Initial |
| Three API styles | Developer choice, different use cases | Initial |
| JSDoc over separate types | Editor autocomplete, LLM friendly | Initial |
| Vitest over Jest | Faster, ESM native | Initial |
| tsup over tsc | Simpler config, dual build | Initial |
| Decorator API | Class-based developers, Angular style | Initial |
| ANSI codes directly | No chalk dependency | Initial |

---

**End of Implementation Architecture**
