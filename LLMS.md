# @oxog/cli - LLM Documentation

> Zero-dependency CLI framework with type-safe commands, beautiful output, and plugin architecture

**Version:** 1.0.0
**License:** MIT
**Repository:** https://github.com/ersinkoc/cli
**Homepage:** https://cli.oxog.dev
**Node.js:** >=18

---

## Quick Reference

### Installation

```bash
npm install @oxog/cli
# or
yarn add @oxog/cli
# or
pnpm add @oxog/cli
```

### Quick Start

```typescript
import { cli } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')
  .describe('My awesome CLI application');

app.command('greet')
  .describe('Greet someone')
  .argument('<name>', 'Name of the person to greet')
  .option('--loud', 'Shout the greeting')
  .action(({ args, options }) => {
    const message = `Hello, ${args.name}!`;
    console.log(options.loud ? message.toUpperCase() : message);
  });

app.run();
```

---

## Package Overview

### Purpose

@oxog/cli is a comprehensive command-line interface framework designed for modern TypeScript applications. It provides a fluent builder API, full TypeScript support, built-in spinner and logging utilities, and a micro-kernel plugin architecture - all with zero runtime dependencies.

### Key Features

- **Zero Runtime Dependencies** - Lightweight and fast, everything implemented from scratch
- **Full TypeScript Support** - Type-safe commands, arguments, and options with strict mode
- **Plugin Architecture** - Micro-kernel design for easy extensibility
- **Beautiful Output** - Built-in colors, spinners, progress bars, and structured logging
- **Robust Parsing** - Advanced argument parsing with validation and coercion
- **Nested Commands** - Support for complex command hierarchies
- **Middleware System** - Pre/post-processing hooks for commands
- **AI-Native Design** - Optimized for both humans and AI assistants

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        User Code                              │
│                  (Fluent Builder API)                         │
├──────────────────────────────────────────────────────────────┤
│                    Plugin Registry API                        │
│          use() · register() · unregister() · list()          │
├─────────┬─────────┬─────────────────────────┬────────────────┤
│  help   │ version │ validation │  spinner  │  logger        │
│  (core) │ (core)  │  (core)    │  color    │  middleware    │
├─────────┴─────────┴────────────┴───────────┴────────────────┤
│     prompt  │  progress  │  table  │  config  │ completion  │
├─────────────┴────────────┴─────────┴──────────┴─────────────┤
│                       Micro Kernel                            │
│   Command Router · Arg Parser · Event Bus · Error Boundary   │
└──────────────────────────────────────────────────────────────┘
```

### Dependencies

- **Runtime:** Zero runtime dependencies
- **Peer:** None
- **Dev:** typescript, vitest, tsup, eslint, prettier

---

## API Reference

### Exports Summary

| Export | Type | Description |
|--------|------|-------------|
| `cli` | function | Create a new CLI application |
| `CLIImplementation` | class | CLI application class |
| `Command` | class | Command definition class |
| `CommandRegistry` | class | Command registry |
| `CommandRouter` | class | Command routing |
| `CLIKernel` | class | Micro-kernel for plugin management |
| `EventBus` | class | Event bus for inter-component communication |
| `CLIError` | class | Base CLI error class |
| `UnknownCommandError` | class | Unknown command error |
| `MissingArgumentError` | class | Missing argument error |
| `InvalidOptionError` | class | Invalid option error |
| `UnknownOptionError` | class | Unknown option error |
| `ValidationError` | class | Validation error |
| `tokenize` | function | Tokenize argv array |
| `parseArguments` | function | Parse positional arguments |
| `parseOptions` | function | Parse options from tokens |
| `colors` | object | Color utility functions |
| `terminal` | object | Terminal utility functions |
| `levenshtein` | function | Calculate Levenshtein distance |
| `fuzzyMatch` | function | Fuzzy string matching |

### Main Entry Point

#### `cli(nameOrOptions)`

Create a new CLI application.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nameOrOptions` | `string \| CLIOptions` | Yes | Application name or options object |

**Returns:** `CLI` instance

**Example:**

```typescript
// With name only
const app = cli('myapp');

// With full options
const app = cli({
  name: 'myapp',
  version: '1.0.0',
  description: 'My CLI application',
  strict: true,
  plugins: [helpPlugin(), versionPlugin()]
});
```

---

### CLI Interface

#### `.version(v?: string): this | string`

Get or set the application version.

```typescript
app.version('1.0.0');      // Set version, returns this
const v = app.version();   // Get version
```

#### `.describe(description: string): this`

Set the application description.

```typescript
app.describe('My awesome CLI application');
```

#### `.command(name: string): CommandBuilder`

Add a new command.

```typescript
app.command('build')
  .describe('Build the project')
  .argument('<input>', 'Input file')
  .option('-o, --output <dir>', 'Output directory')
  .action(async ({ args, options }) => {
    console.log(`Building ${args.input} to ${options.output}`);
  });
```

#### `.option(flags: string, description?: string, options?: Partial<OptionDef>): this`

Add a global option.

```typescript
app.option('-v, --verbose', 'Enable verbose output');
app.option('-c, --config <file>', 'Config file path', { default: 'config.json' });
```

#### `.use(plugin: CLIPlugin): this`

Register a plugin.

```typescript
import { colorPlugin, spinnerPlugin, loggerPlugin } from '@oxog/cli/plugins';

app
  .use(colorPlugin())
  .use(spinnerPlugin())
  .use(loggerPlugin());
```

#### `.run(argv?: string[]): void`

Run the CLI application.

```typescript
app.run();                        // Uses process.argv.slice(2)
app.run(['build', '--output', 'dist']);  // Custom arguments
```

---

### CommandBuilder Interface

#### `.describe(description: string): this`

Set command description.

```typescript
app.command('deploy').describe('Deploy to production');
```

#### `.argument(def: string, description?: string): this`

Add a positional argument.

**Argument Syntax:**
- `<name>` - Required argument
- `[name]` - Optional argument
- `<names...>` - Required variadic (multiple values)
- `[names...]` - Optional variadic

```typescript
app.command('copy')
  .argument('<source>', 'Source file')
  .argument('<dest>', 'Destination')
  .argument('[extras...]', 'Additional files');
```

#### `.option(flags: string, description?: string, options?: Partial<OptionDef>): this`

Add a command option.

**Option Syntax:**
- `-s, --short` - Boolean flag
- `-p, --port <number>` - Option with value
- `-f, --files <items...>` - Array option

```typescript
app.command('server')
  .option('-p, --port <number>', 'Port number', { type: 'number', default: 3000 })
  .option('-h, --host <string>', 'Host address', { default: 'localhost' })
  .option('-w, --watch', 'Enable watch mode');
```

#### `.alias(...aliases: string[]): this`

Add command aliases.

```typescript
app.command('install')
  .alias('i', 'add');  // Can use: myapp install, myapp i, myapp add
```

#### `.action(handler: ActionHandler): this`

Set the action handler.

```typescript
app.command('greet')
  .action(({ args, options, command, app }) => {
    console.log(`Hello, ${args.name}!`);
  });

// Async action
app.command('deploy')
  .action(async ({ args, options, spinner, logger }) => {
    const spin = spinner.start('Deploying...');
    await deploy();
    spin.succeed('Deployed!');
  });
```

#### `.use(middleware: Middleware): this`

Add command-specific middleware.

```typescript
const authMiddleware = async (ctx, next) => {
  if (!ctx.options.token) {
    throw new Error('Authentication required');
  }
  await next();
};

app.command('deploy')
  .use(authMiddleware)
  .action(() => { /* ... */ });
```

#### `.addCommand(name: string): CommandBuilder`

Add a nested subcommand.

```typescript
app.command('config')
  .describe('Configuration commands')
  .addCommand('get')
    .describe('Get a config value')
    .argument('<key>', 'Config key')
    .action(({ args }) => console.log(config[args.key]))
  .parent()
  .addCommand('set')
    .describe('Set a config value')
    .argument('<key>', 'Config key')
    .argument('<value>', 'Config value')
    .action(({ args }) => { config[args.key] = args.value; });
```

---

### ActionContext Interface

The context object passed to action handlers.

| Property | Type | Description |
|----------|------|-------------|
| `args` | `Record<string, unknown>` | Parsed positional arguments |
| `options` | `Record<string, unknown>` | Parsed options |
| `argv` | `string[]` | Raw argv array |
| `command` | `Command` | Current command instance |
| `app` | `CLI` | CLI application instance |
| `prompt?` | `PromptUtils` | Interactive prompt utilities (if prompt plugin enabled) |
| `spinner?` | `SpinnerUtils` | Spinner utilities (if spinner plugin enabled) |
| `logger?` | `LoggerUtils` | Logger utilities (if logger plugin enabled) |
| `color?` | `ColorUtils` | Color utilities (if color plugin enabled) |
| `progress?` | `ProgressUtils` | Progress bar utilities (if progress plugin enabled) |
| `table?` | `TableUtils` | Table formatting utilities (if table plugin enabled) |
| `config?` | `ConfigUtils` | Config file utilities (if config plugin enabled) |
| `completion?` | `CompletionUtils` | Shell completion utilities (if completion plugin enabled) |

---

### Types & Interfaces

#### `CLIOptions`

```typescript
interface CLIOptions {
  /** Application name (kebab-case recommended) */
  name: string;
  /** Semantic version (e.g., "1.0.0") */
  version?: string;
  /** Application description for help output */
  description?: string;
  /** Enable strict mode (fail on unknown options) */
  strict?: boolean;
  /** Custom help formatter function */
  helpFormatter?: (context: HelpContext) => string;
  /** Custom error handler function */
  errorHandler?: (error: CLIError) => never | void;
  /** Initial plugins to load */
  plugins?: CLIPlugin[];
}
```

#### `ArgumentDef`

```typescript
interface ArgumentDef {
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
```

#### `OptionDef`

```typescript
interface OptionDef {
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
```

#### `CLIPlugin`

```typescript
interface CLIPlugin<TContext = CLIContext> {
  /** Unique plugin identifier (kebab-case) */
  name: string;
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  /** Other plugins this plugin depends on */
  dependencies?: string[];
  /** Called when plugin is registered */
  install: (kernel: CLIKernel<TContext>) => void;
  /** Called after all plugins are installed */
  onInit?: (context: TContext) => void | Promise<void>;
  /** Called when plugin is unregistered */
  onDestroy?: () => void | Promise<void>;
  /** Called on error in this plugin */
  onError?: (error: Error) => void;
}
```

#### `Middleware`

```typescript
type Middleware = (
  ctx: ActionContext,
  next: () => Promise<void>
) => void | Promise<void>;
```

---

## Plugins

Import plugins from `@oxog/cli/plugins`:

```typescript
import {
  // Core plugins
  helpPlugin,
  versionPlugin,
  validationPlugin,
  // Optional plugins
  colorPlugin,
  spinnerPlugin,
  loggerPlugin,
  middlewarePlugin,
  promptPlugin,
  progressPlugin,
  tablePlugin,
  configPlugin,
  completionPlugin
} from '@oxog/cli/plugins';
```

### Core Plugins

#### `helpPlugin(options?)`

Automatic help text generation.

```typescript
app.use(helpPlugin());

// With custom formatter
app.use(helpPlugin({
  format: (context) => `Custom help for ${context.app.name}`
}));
```

#### `versionPlugin(options?)`

Version display support (--version, -V).

```typescript
app.use(versionPlugin());
```

#### `validationPlugin()`

Argument and option validation.

```typescript
app.use(validationPlugin());
```

### Optional Plugins

#### `colorPlugin()`

ANSI color support for beautiful output.

```typescript
app.use(colorPlugin());

app.command('status').action(({ color }) => {
  console.log(color.green('Success!'));
  console.log(color.red('Error!'));
  console.log(color.yellow('Warning!'));
});
```

#### `spinnerPlugin()`

Elegant loading spinners.

```typescript
app.use(spinnerPlugin());

app.command('deploy').action(async ({ spinner }) => {
  const spin = spinner.start('Deploying...');

  // Update text
  spin.update('Still deploying...');

  // Complete with different states
  spin.succeed('Deployed!');    // Green checkmark
  spin.fail('Failed!');         // Red X
  spin.warn('Warning!');        // Yellow warning
  spin.info('Info');            // Blue info
});
```

#### `loggerPlugin(options?)`

Structured logging with levels.

```typescript
app.use(loggerPlugin({
  level: 'info',      // 'debug' | 'info' | 'warn' | 'error'
  timestamp: true     // Show timestamps
}));

app.command('run').action(({ logger }) => {
  logger.debug('Debug info');
  logger.info('Info message');
  logger.warn('Warning message');
  logger.error('Error message');
});
```

#### `middlewarePlugin()`

Command middleware support.

```typescript
app.use(middlewarePlugin());

// Global middleware
app.middleware(async (ctx, next) => {
  console.log('Before:', ctx.command.name);
  await next();
  console.log('After:', ctx.command.name);
});

// Command-specific middleware
app.command('deploy')
  .use(authMiddleware)
  .use(loggingMiddleware)
  .action(() => { /* ... */ });
```

#### `promptPlugin(options?)`

Interactive command-line prompts with 10 prompt types.

```typescript
app.use(promptPlugin());

app.command('init').action(async ({ prompt }) => {
  // Text input
  const name = await prompt.input({ message: 'Project name:' });

  // Password (masked)
  const password = await prompt.password({ message: 'Enter password:' });

  // Confirmation
  const confirmed = await prompt.confirm({ message: 'Continue?', default: true });

  // Select from choices
  const framework = await prompt.select({
    message: 'Select framework:',
    choices: ['React', 'Vue', 'Svelte']
  });

  // Multi-select
  const features = await prompt.multiselect({
    message: 'Select features:',
    choices: ['TypeScript', 'ESLint', 'Prettier', 'Testing']
  });

  // Number input
  const port = await prompt.number({ message: 'Port:', default: 3000 });

  // Autocomplete with fuzzy search
  const dep = await prompt.autocomplete({
    message: 'Search package:',
    choices: packages
  });
});
```

#### `progressPlugin()`

Progress bars with ETA and rate display.

```typescript
app.use(progressPlugin());

app.command('download').action(async ({ progress }) => {
  const bar = progress.create({
    total: 100,
    format: ':bar :percent :eta',
    width: 40
  });

  for (let i = 0; i <= 100; i++) {
    await delay(50);
    bar.update(i);
  }
});

// Multi-progress bars
app.command('parallel').action(async ({ progress }) => {
  const multi = progress.multi();

  const bar1 = multi.create({ total: 100 });
  const bar2 = multi.create({ total: 50 });

  // Update bars independently
  bar1.increment();
  bar2.increment(5);

  multi.stop();
});
```

#### `tablePlugin()`

Formatted table output with multiple border styles.

```typescript
app.use(tablePlugin());

app.command('list').action(({ table }) => {
  const data = [
    { name: 'Alice', age: 30, city: 'NYC' },
    { name: 'Bob', age: 25, city: 'LA' },
    { name: 'Charlie', age: 35, city: 'Chicago' }
  ];

  // Print with default settings
  table.print(data);

  // Custom options
  table.print(data, {
    columns: ['name', 'age'],
    border: 'rounded',  // 'none' | 'single' | 'double' | 'rounded' | 'heavy' | 'ascii'
    header: true,
    padding: 1
  });

  // Custom column definitions
  table.print(data, {
    columns: [
      { key: 'name', header: 'Name', align: 'left' },
      { key: 'age', header: 'Age', align: 'right', format: (v) => `${v} years` }
    ]
  });
});
```

#### `configPlugin(options?)`

Configuration file support (JSON, YAML, TOML, .env).

```typescript
app.use(configPlugin({
  name: 'myapp',           // App name for config lookup
  defaults: { port: 3000 }, // Default values
  envPrefix: 'MYAPP'        // Env var prefix (MYAPP_PORT)
}));

// Searches for: myapp.config.json, .myapprc, .myapprc.yaml, .env, package.json

app.command('start').action(async ({ config }) => {
  // Get config value by path
  const port = config.get('port', 3000);
  const dbHost = config.get('database.host', 'localhost');

  // Access full config
  console.log(config.config);

  // Reload configuration
  await config.reload();
});
```

#### `completionPlugin(options?)`

Shell completion script generation.

```typescript
app.use(completionPlugin());

// This adds a 'completion' command automatically
// Usage:
//   myapp completion bash > ~/.bashrc
//   myapp completion zsh > ~/.zshrc
//   myapp completion fish > ~/.config/fish/completions/myapp.fish
//   myapp completion --install   # Show installation instructions

// Programmatic access
app.command('setup').action(({ completion }) => {
  const shell = completion.detectShell();  // 'bash' | 'zsh' | 'fish'
  const script = completion.generate(shell);
  const instructions = completion.instructions(shell);
});
```

---

## Usage Patterns

### Pattern 1: Basic CLI Application

**Use Case:** Simple command-line tool with a few commands

```typescript
import { cli } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')
  .describe('My CLI application');

app.command('hello')
  .describe('Say hello')
  .argument('<name>', 'Name to greet')
  .option('--uppercase', 'Uppercase the greeting')
  .action(({ args, options }) => {
    const msg = `Hello, ${args.name}!`;
    console.log(options.uppercase ? msg.toUpperCase() : msg);
  });

app.run();
```

### Pattern 2: CLI with Plugins

**Use Case:** CLI with rich output, logging, and spinners

```typescript
import { cli } from '@oxog/cli';
import { colorPlugin, spinnerPlugin, loggerPlugin } from '@oxog/cli/plugins';

const app = cli('myapp')
  .version('1.0.0')
  .use(colorPlugin())
  .use(spinnerPlugin())
  .use(loggerPlugin());

app.command('build')
  .describe('Build the project')
  .option('-w, --watch', 'Watch mode')
  .action(async ({ options, spinner, logger }) => {
    logger.info('Starting build...');

    const spin = spinner.start('Compiling...');
    await compile();
    spin.succeed('Compiled!');

    if (options.watch) {
      logger.info('Watching for changes...');
    }
  });

app.run();
```

### Pattern 3: Nested Commands

**Use Case:** Complex CLI with command hierarchies

```typescript
import { cli } from '@oxog/cli';

const app = cli('myapp').version('1.0.0');

// Create parent command
const config = app.command('config').describe('Configuration commands');

// Add subcommands
config.addCommand('get')
  .describe('Get a config value')
  .argument('<key>', 'Config key')
  .action(({ args }) => {
    console.log(`Value: ${getConfig(args.key)}`);
  });

config.addCommand('set')
  .describe('Set a config value')
  .argument('<key>', 'Config key')
  .argument('<value>', 'Config value')
  .action(({ args }) => {
    setConfig(args.key, args.value);
    console.log('Config updated');
  });

config.addCommand('list')
  .describe('List all config values')
  .action(() => {
    console.log(JSON.stringify(getConfig(), null, 2));
  });

app.run();
```

### Pattern 4: With Validation

**Use Case:** CLI with input validation

```typescript
import { cli } from '@oxog/cli';
import { validationPlugin } from '@oxog/cli/plugins';

const app = cli('myapp')
  .use(validationPlugin());

app.command('server')
  .describe('Start a server')
  .option('-p, --port <number>', 'Port number', {
    type: 'number',
    default: 3000,
    validate: (v) => (v > 0 && v < 65536) || 'Port must be between 1-65535'
  })
  .option('-e, --env <name>', 'Environment', {
    choices: ['development', 'staging', 'production'],
    default: 'development'
  })
  .action(({ options }) => {
    console.log(`Starting server on port ${options.port} in ${options.env} mode`);
  });

app.run();
```

### Pattern 5: Create App CLI

**Use Case:** Project scaffolding CLI like create-react-app

```typescript
import { cli } from '@oxog/cli';
import { colorPlugin, spinnerPlugin } from '@oxog/cli/plugins';

const templates = ['vanilla-ts', 'react', 'vue', 'svelte'];

const app = cli('create-app')
  .version('1.0.0')
  .describe('Create a new application')
  .use(colorPlugin())
  .use(spinnerPlugin());

app.command('create')
  .alias('c')
  .describe('Create a new application')
  .argument('[name]', 'Project name', { default: 'my-app' })
  .option('-t, --template <name>', 'Template to use', {
    choices: templates,
    default: 'vanilla-ts'
  })
  .option('--git', 'Initialize git repository', { default: true })
  .option('--install', 'Install dependencies', { default: true })
  .action(async ({ args, options, spinner, color }) => {
    console.log(color.cyan.bold(`Creating ${args.name}...`));

    const spin1 = spinner.start('Creating project structure...');
    await createStructure(args.name, options.template);
    spin1.succeed('Project structure created');

    if (options.git) {
      const spin2 = spinner.start('Initializing git...');
      await initGit(args.name);
      spin2.succeed('Git initialized');
    }

    if (options.install) {
      const spin3 = spinner.start('Installing dependencies...');
      await installDeps(args.name);
      spin3.succeed('Dependencies installed');
    }

    console.log(color.green.bold('Done!'));
    console.log(`\n  cd ${args.name}\n  npm start\n`);
  });

app.run();
```

---

## Error Reference

### Error Types

#### `CLIError`

Base error class for all CLI errors.

```typescript
class CLIError extends Error {
  code: string;      // Error code for programmatic handling
  exitCode: number;  // Exit code for process termination

  constructor(message: string, code: string, exitCode?: number);
}

// Usage
throw new CLIError('File not found', 'FILE_NOT_FOUND', 404);
```

#### `UnknownCommandError`

Thrown when a command is not found.

```typescript
class UnknownCommandError extends CLIError {
  command: string;  // The unknown command name
}

// Usage
throw new UnknownCommandError('depoly');  // Suggests "deploy"
```

#### `MissingArgumentError`

Thrown when a required argument is missing.

```typescript
class MissingArgumentError extends CLIError {
  argument: string;  // The missing argument name
}

throw new MissingArgumentError('filename');
```

#### `InvalidOptionError`

Thrown when an option value is invalid.

```typescript
class InvalidOptionError extends CLIError {
  option: string;    // The option name
  value: unknown;    // The invalid value
  expected: string;  // Expected type or format
}

throw new InvalidOptionError('port', 'abc', 'number');
```

#### `UnknownOptionError`

Thrown when an unknown option is provided.

```typescript
class UnknownOptionError extends CLIError {
  option: string;  // The unknown option
}

throw new UnknownOptionError('verbos');  // Suggests "--verbose"
```

#### `ValidationError`

Thrown when validation fails.

```typescript
class ValidationError extends CLIError {
  constructor(message: string);
}

throw new ValidationError('Port must be between 1 and 65536');
```

### Error Codes

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| `UNKNOWN_COMMAND` | Command not found | Typo in command name | Check command name, see "Did you mean?" |
| `MISSING_ARGUMENT` | Missing required argument | Required arg not provided | Provide the required argument |
| `INVALID_OPTION` | Invalid option value | Wrong type or format | Use correct value type |
| `UNKNOWN_OPTION` | Unknown option | Option doesn't exist | Check available options |
| `VALIDATION_ERROR` | Validation failed | Custom validation failed | Fix validation errors |

---

## Utilities

### Color Utilities

```typescript
import { colors, colorize, hexToAnsi, rgbToAnsi } from '@oxog/cli';

// Named colors
colors.red('Error text');
colors.green('Success text');
colors.yellow('Warning text');
colors.blue('Info text');
colors.cyan('Highlight');
colors.magenta('Accent');
colors.gray('Muted text');

// Styles
colors.bold('Bold text');
colors.dim('Dim text');
colors.italic('Italic text');
colors.underline('Underlined text');

// Background colors
colors.bgRed('Red background');
colors.bgGreen('Green background');

// Custom colors
colors.hex('#ff6600', 'Custom orange');
colors.rgb(255, 100, 0, 'RGB color');

// Low-level
colorize('text', '\x1b[31m');  // Apply ANSI code
```

### Terminal Utilities

```typescript
import { terminal, getTerminalWidth, getTerminalHeight } from '@oxog/cli';

// Terminal size
const width = terminal.width;   // or getTerminalWidth()
const height = terminal.height; // or getTerminalHeight()

// Screen control
terminal.clear();      // Clear entire screen
terminal.clearLine();  // Clear current line

// Cursor control
terminal.cursorUp(1);
terminal.cursorDown(1);
terminal.cursorLeft(1);
terminal.cursorRight(1);
terminal.cursorTo(row, col);
terminal.hideCursor();
terminal.showCursor();

// Detection
terminal.isTTY;     // Is running in terminal?
terminal.color;     // Supports colors?
terminal.unicode;   // Supports unicode?
terminal.type;      // Terminal type (e.g., "xterm")
```

### String Matching Utilities

```typescript
import { levenshtein, findBestMatch, fuzzyMatch } from '@oxog/cli';

// Levenshtein distance
levenshtein('kitten', 'sitting');  // 3

// Find best match (for "Did you mean?")
findBestMatch('depoly', ['deploy', 'build', 'test']);  // 'deploy'

// Fuzzy matching
fuzzyMatch('abc', 'aXbYc');  // true
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NO_COLOR` | Disable color output | - |
| `FORCE_COLOR` | Force color output | - |
| `TERM` | Terminal type | `unknown` |

### Strict Mode

Enable strict mode to fail on unknown options:

```typescript
const app = cli({
  name: 'myapp',
  strict: true  // Throws on unknown options
});
```

---

## TypeScript Support

### Type Imports

```typescript
import type {
  // Core types
  CLI,
  CLIOptions,
  CLIPlugin,
  CLIKernel,
  CLIContext,
  Command,
  CommandBuilder,
  CommandDef,
  ArgumentDef,
  OptionDef,
  ActionContext,
  ActionHandler,
  Middleware,
  // Plugin utility types
  Spinner,
  SpinnerUtils,
  LoggerUtils,
  PromptUtils,
  ColorUtils,
  ProgressBar,
  ProgressBarOptions,
  ProgressUtils,
  TableUtils,
  TableOptions,
  TableColumnDef,
  TableBorderStyle,
  TableAlignment,
  ConfigUtils,
  CompletionUtils,
  ShellType
} from '@oxog/cli';
```

### Creating Custom Plugins

```typescript
import type { CLIPlugin, CLIKernel } from '@oxog/cli';

const myPlugin: CLIPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  dependencies: [],  // Optional: other plugins this depends on

  install(kernel: CLIKernel) {
    // Called when plugin is registered
    kernel.on('command:before', async (data) => {
      console.log('Before command:', data.command.name);
    });

    kernel.on('command:after', async (data) => {
      console.log('After command:', data.command.name);
    });
  },

  onInit(context) {
    // Called after all plugins are installed
    console.log('Plugin initialized');
  },

  onDestroy() {
    // Called when plugin is unregistered
    console.log('Plugin destroyed');
  },

  onError(error) {
    // Called on error in this plugin
    console.error('Plugin error:', error);
  }
};

// Use the plugin
app.use(myPlugin);
```

---

## Comparison with Alternatives

| Feature | @oxog/cli | Commander.js | Yargs |
|---------|-----------|--------------|-------|
| Zero dependencies | Yes | No | No |
| TypeScript native | Yes | Types via @types | Yes |
| Plugin system | Yes (micro-kernel) | Limited | Middleware |
| Built-in colors | Yes | No | No |
| Built-in spinners | Yes | No | No |
| Built-in logging | Yes | No | No |
| Progress bars | Yes | No | No |
| Table formatting | Yes | No | No |
| Interactive prompts | Yes | No | No |
| Config file support | Yes | No | No |
| Shell completions | Yes | Manual | Yes |
| Fluent API | Yes | Yes | Yes |
| Nested commands | Yes | Yes | Yes |
| Middleware | Yes | No | Yes |
| Validation | Built-in | Manual | Built-in |
| Bundle size | ~25KB gzipped | ~20KB | ~40KB |

---

## FAQ

### Q: How do I access parsed arguments and options?

**A:** Arguments and options are available in the action handler context:

```typescript
app.command('example')
  .argument('<name>')
  .option('--verbose')
  .action(({ args, options }) => {
    console.log(args.name);       // Parsed argument
    console.log(options.verbose); // Parsed option
  });
```

### Q: How do I handle async operations?

**A:** Action handlers can be async. Use the spinner plugin for visual feedback:

```typescript
app.command('deploy')
  .action(async ({ spinner }) => {
    const spin = spinner.start('Deploying...');
    await deploy();
    spin.succeed('Done!');
  });
```

### Q: How do I add global options?

**A:** Use `.option()` on the CLI instance:

```typescript
const app = cli('myapp')
  .option('-v, --verbose', 'Verbose output')
  .option('-c, --config <file>', 'Config file');
```

### Q: How do I create subcommands?

**A:** Use `.addCommand()` on a parent command:

```typescript
app.command('db')
  .addCommand('migrate')
    .action(() => { /* migrate */ })
  .parent()
  .addCommand('seed')
    .action(() => { /* seed */ });
```

### Q: How do I validate option values?

**A:** Use the `validate` option or `choices`:

```typescript
.option('-p, --port <number>', 'Port', {
  type: 'number',
  validate: (v) => v > 0 && v < 65536 || 'Invalid port',
  choices: [3000, 8080, 8443]  // Or use choices
})
```

---

## Links

- **NPM:** https://www.npmjs.com/package/@oxog/cli
- **GitHub:** https://github.com/ersinkoc/cli
- **Documentation:** https://cli.oxog.dev
- **Issues:** https://github.com/ersinkoc/cli/issues
- **Changelog:** https://github.com/ersinkoc/cli/blob/main/CHANGELOG.md

---

## Document Metadata

- **Generated:** 2026-01-07
- **Updated:** 2026-01-07
- **Package Version:** 1.0.0
- **Documentation Version:** 1.1
- **Format:** LLM-Optimized Markdown
- **New in 1.1:** Added promptPlugin, progressPlugin, tablePlugin, configPlugin, completionPlugin
