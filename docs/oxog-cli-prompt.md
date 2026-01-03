# @oxog/cli - Zero-Dependency CLI Framework

## Package Identity

| Field | Value |
|-------|-------|
| **NPM Package** | `@oxog/cli` |
| **GitHub Repository** | `https://github.com/ersinkoc/cli` |
| **Documentation Site** | `https://cli.oxog.dev` |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |

> **NO social media, Discord, email, or external links allowed.**

---

## Package Description

**One-line:** Zero-dependency CLI framework with type-safe commands, beautiful output, and plugin architecture

@oxog/cli is a comprehensive command-line interface framework that rivals and surpasses Commander.js. It provides three API styles (Fluent Builder, Object Config, Decorator-based), full TypeScript support with end-to-end type inference, built-in interactive prompts, colorized output, progress indicators, config file parsing, shell completion, and a micro-kernel plugin architecture. Designed to be the only CLI library you'll ever need - from simple scripts to enterprise-grade CLI applications.

---

## NON-NEGOTIABLE RULES

These rules are **ABSOLUTE** and must be followed without exception.

### 1. ZERO RUNTIME DEPENDENCIES

```json
{
  "dependencies": {}  // MUST BE EMPTY - NO EXCEPTIONS
}
```

- Implement EVERYTHING from scratch
- No commander, no inquirer, no chalk, no ora - nothing
- Write your own ANSI parser, prompt handler, argument parser
- If you think you need a dependency, you don't

**Allowed devDependencies only:**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "tsup": "^8.0.0",
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "eslint": "^9.0.0"
  }
}
```

### 2. 100% TEST COVERAGE

- Every line of code must be tested
- Every branch must be tested
- Every function must be tested
- **All tests must pass** (100% success rate)
- Use Vitest for testing
- Coverage thresholds enforced in config

### 3. MICRO-KERNEL ARCHITECTURE

All packages MUST use plugin-based architecture:

```
┌──────────────────────────────────────────────────────────────┐
│                        User Code                              │
│         (Fluent Builder / Object Config / Decorators)         │
├──────────────────────────────────────────────────────────────┤
│                    Plugin Registry API                        │
│          use() · register() · unregister() · list()          │
├─────────┬─────────┬─────────────────────────┬────────────────┤
│  help   │ version │ validation │  prompt   │  Community     │
│  (core) │ (core)  │  (core)    │  spinner  │  Plugins       │
│         │         │            │  color    │                │
│         │         │            │  table    │  cli-plugin-ai │
│         │         │            │  config   │  cli-plugin-git│
│         │         │            │  complete │  ...           │
│         │         │            │  logger   │                │
│         │         │            │  update   │                │
│         │         │            │  middleware                │
├─────────┴─────────┴────────────┴───────────┴────────────────┤
│                       Micro Kernel                            │
│   Command Router · Arg Parser · Event Bus · Error Boundary   │
└──────────────────────────────────────────────────────────────┘
```

**Kernel responsibilities (minimal):**
- Command registration and routing
- Argument/option parsing (basic tokenization)
- Plugin registration and lifecycle
- Event bus for inter-plugin communication
- Error boundary and recovery
- Configuration management

### 4. DEVELOPMENT WORKFLOW

Create these documents **FIRST**, before any code:

1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions  
3. **TASKS.md** - Ordered task list with dependencies

Only after all three documents are complete, implement code following TASKS.md sequentially.

### 5. TYPESCRIPT STRICT MODE

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

### 6. LLM-NATIVE DESIGN

Package must be designed for both humans AND AI assistants:

- **llms.txt** file in root (< 2000 tokens)
- **Predictable API** naming (`create`, `command`, `option`, `argument`, `action`, `use`, `run`)
- **Rich JSDoc** with @example on every public API
- **18+ examples** organized by category
- **README** optimized for LLM consumption

### 7. NO EXTERNAL LINKS

- ✅ GitHub repository URL
- ✅ Custom domain (cli.oxog.dev)
- ✅ npm package URL
- ❌ Social media (Twitter, LinkedIn, etc.)
- ❌ Discord/Slack links
- ❌ Email addresses
- ❌ Donation/sponsor links

---

## CORE FEATURES

### 1. Three API Styles

The framework supports three distinct API styles to accommodate different developer preferences.

**Fluent Builder API (Primary):**
```typescript
import { cli } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')
  .description('My awesome CLI')
  
  .command('init')
    .description('Initialize a new project')
    .argument('<name>', 'Project name')
    .option('-t, --template <type>', 'Template to use', 'default')
    .option('-f, --force', 'Overwrite existing files')
    .action(async ({ args, options, prompt, spinner }) => {
      const name = args.name;
      const template = options.template ?? await prompt.select({
        message: 'Choose a template',
        choices: ['default', 'typescript', 'react']
      });
      const spin = spinner.start('Creating project...');
      // ...implementation
      spin.succeed('Project created!');
    });

app.run();
```

**Object Config API:**
```typescript
import { cli } from '@oxog/cli';

const app = cli({
  name: 'myapp',
  version: '1.0.0',
  commands: {
    init: {
      description: 'Initialize a new project',
      arguments: {
        name: { type: 'string', required: true, description: 'Project name' }
      },
      options: {
        template: { type: 'string', alias: 't', default: 'default' },
        force: { type: 'boolean', alias: 'f' }
      },
      action: async (ctx) => { /* ... */ }
    }
  }
});

app.run();
```

**Decorator API:**
```typescript
import { CLI, Command, Argument, Option } from '@oxog/cli';

@CLI({ name: 'myapp', version: '1.0.0' })
class MyApp {
  
  @Command('init', { description: 'Initialize a new project' })
  async init(
    @Argument('name') name: string,
    @Option('template', { alias: 't', default: 'default' }) template: string,
    @Option('force', { alias: 'f' }) force: boolean
  ) {
    // ...implementation
  }
}

new MyApp().run();
```

### 2. Command System

Full-featured command system with nested subcommands, aliases, and middleware.

```typescript
// Nested subcommands
app.command('config')
  .description('Manage configuration')
  .command('get')
    .argument('<key>', 'Config key')
    .action(({ args }) => console.log(getConfig(args.key)))
  .parent()
  .command('set')
    .argument('<key>', 'Config key')
    .argument('<value>', 'Config value')
    .action(({ args }) => setConfig(args.key, args.value));

// Command aliases
app.command('install')
  .alias('i', 'add')
  .action(() => { /* ... */ });

// Global options
app.option('-v, --verbose', 'Enable verbose output');
app.option('-q, --quiet', 'Suppress output');
```

### 3. Argument & Option Parsing

Robust argument parsing with type coercion and validation.

```typescript
// Positional arguments
.argument('<required>', 'Required argument')
.argument('[optional]', 'Optional argument')
.argument('<items...>', 'Variadic argument (1 or more)')
.argument('[items...]', 'Optional variadic (0 or more)')

// Options with types
.option('-p, --port <number>', 'Port number', { type: 'number', default: 3000 })
.option('-e, --env <string>', 'Environment', { choices: ['dev', 'prod', 'test'] })
.option('-f, --files <paths...>', 'File paths', { type: 'array' })
.option('--no-color', 'Disable colors') // Negatable boolean
.option('-D, --define <key=value...>', 'Define variables', { type: 'object' })

// Coercion
.option('-d, --date <date>', 'Date', { 
  coerce: (v) => new Date(v),
  validate: (d) => !isNaN(d.getTime())
})
```

### 4. Full-Featured Interactive Prompts

Complete interactive prompt system matching and exceeding Inquirer.js capabilities.

```typescript
// Basic prompts
const name = await prompt.input({ message: 'Your name:' });
const password = await prompt.password({ message: 'Password:' });
const confirmed = await prompt.confirm({ message: 'Continue?' });

// Selection prompts
const color = await prompt.select({
  message: 'Choose color:',
  choices: [
    { value: 'red', label: 'Red', hint: 'A warm color' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' }
  ]
});

const features = await prompt.multiselect({
  message: 'Select features:',
  choices: ['TypeScript', 'ESLint', 'Prettier', 'Tests'],
  min: 1,
  max: 3
});

// Autocomplete with fuzzy search
const framework = await prompt.autocomplete({
  message: 'Framework:',
  choices: ['React', 'Vue', 'Angular', 'Svelte', 'Solid'],
  limit: 5
});

// Numeric input
const age = await prompt.number({
  message: 'Your age:',
  min: 0,
  max: 150,
  step: 1
});

// Date picker
const birthday = await prompt.date({
  message: 'Birthday:',
  format: 'YYYY-MM-DD'
});

// Editor (opens $EDITOR)
const content = await prompt.editor({
  message: 'Description:',
  extension: '.md'
});

// Multi-step wizard
const result = await prompt.wizard({
  steps: [
    { name: 'name', prompt: { type: 'input', message: 'Name:' } },
    { name: 'email', prompt: { type: 'input', message: 'Email:' } },
    { 
      name: 'plan', 
      prompt: { 
        type: 'select', 
        message: 'Plan:',
        choices: ['free', 'pro', 'enterprise']
      },
      when: (answers) => answers.name.length > 0
    }
  ]
});
```

### 5. Beautiful Output

ANSI color support, spinners, progress bars, and table formatting.

```typescript
// Colors
import { color } from '@oxog/cli';

console.log(color.red('Error!'));
console.log(color.green.bold('Success!'));
console.log(color.bgBlue.white(' INFO '));
console.log(color.hex('#ff6600')('Custom color'));
console.log(color.rgb(255, 100, 0)('RGB color'));

// Spinners
const spin = spinner.start('Loading...');
spin.text = 'Still loading...';
spin.succeed('Done!');
// or spin.fail('Failed!'), spin.warn('Warning'), spin.info('Info')

// Progress bars
const bar = progress.create({
  total: 100,
  format: '{bar} {percentage}% | {value}/{total}'
});
bar.update(50);
bar.increment(10);
bar.stop();

// Tables
const data = [
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' }
];
console.log(table(data, {
  columns: ['name', 'age', 'city'],
  header: true,
  border: 'rounded' // 'none', 'single', 'double', 'rounded'
}));
```

### 6. Config File Support

Parse and merge configuration from multiple file formats.

```typescript
// Auto-detect config files
const config = await loadConfig({
  name: 'myapp',
  searchPlaces: [
    'myapp.config.js',
    'myapp.config.json',
    '.myapprc',
    '.myapprc.json',
    '.myapprc.yaml',
    '.myapprc.toml',
    'package.json'
  ],
  defaults: {
    port: 3000,
    verbose: false
  }
});

// Environment variable support
// MYAPP_PORT=8080 will override config.port
```

### 7. Shell Completion

Generate shell completion scripts for bash, zsh, and fish.

```typescript
app.command('completion')
  .description('Generate shell completion')
  .argument('[shell]', 'Shell type', { choices: ['bash', 'zsh', 'fish'] })
  .action(({ args }) => {
    const script = generateCompletion(app, args.shell ?? detectShell());
    console.log(script);
  });
```

### 8. "Did You Mean?" Suggestions

Levenshtein distance-based typo correction.

```typescript
// User types: myapp confg
// Output: Did you mean "config"?

// User types: myapp instal
// Output: Did you mean "install"?
```

### 9. Update Notifier

Check for package updates and notify users.

```typescript
app.use(updateNotifier({
  pkg: { name: '@oxog/cli', version: '1.0.0' },
  checkInterval: '1d', // Check once per day
  message: 'Update available: {current} → {latest}'
}));
```

### 10. Middleware System

Command middleware for authentication, logging, analytics.

```typescript
// Global middleware
app.use(async (ctx, next) => {
  console.log(`Running: ${ctx.command}`);
  const start = Date.now();
  await next();
  console.log(`Completed in ${Date.now() - start}ms`);
});

// Command-specific middleware
app.command('deploy')
  .use(requireAuth)
  .use(checkPermissions('deploy'))
  .action(async (ctx) => { /* ... */ });
```

---

## PLUGIN SYSTEM

### Plugin Interface

```typescript
/**
 * Plugin interface for extending CLI kernel functionality.
 * 
 * @typeParam TContext - Shared context type between plugins
 * 
 * @example
 * ```typescript
 * const myPlugin: CLIPlugin = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   install: (kernel) => {
 *     kernel.on('command:before', (ctx) => {
 *       console.log('Before command:', ctx.command);
 *     });
 *   }
 * };
 * 
 * app.use(myPlugin);
 * ```
 */
export interface CLIPlugin<TContext = CLIContext> {
  /** Unique plugin identifier (kebab-case) */
  name: string;
  
  /** Semantic version (e.g., "1.0.0") */
  version: string;
  
  /** Other plugins this plugin depends on */
  dependencies?: string[];
  
  /**
   * Called when plugin is registered.
   * @param kernel - The CLI kernel instance
   */
  install: (kernel: CLIKernel<TContext>) => void;
  
  /**
   * Called after all plugins are installed.
   * @param context - Shared context object
   */
  onInit?: (context: TContext) => void | Promise<void>;
  
  /**
   * Called when plugin is unregistered.
   */
  onDestroy?: () => void | Promise<void>;
  
  /**
   * Called on error in this plugin.
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;
}
```

### Core Plugins (Always Loaded)

| Plugin | Description |
|--------|-------------|
| `help` | Auto-generated help output with colors, usage examples |
| `version` | Version display (`--version`, `-V`) |
| `validation` | Type validation for arguments and options |

### Optional Plugins (Opt-in)

| Plugin | Description | Enable |
|--------|-------------|--------|
| `prompt` | Full interactive prompts (input, select, confirm, password, autocomplete, wizard, etc.) | `app.use(promptPlugin)` |
| `spinner` | Loading spinners and progress bars | `app.use(spinnerPlugin)` |
| `color` | ANSI colorized output | `app.use(colorPlugin)` |
| `table` | Table formatting with borders | `app.use(tablePlugin)` |
| `config` | Config file support (.json, .yaml, .toml, .env) | `app.use(configPlugin)` |
| `completion` | Shell autocompletion (bash, zsh, fish) | `app.use(completionPlugin)` |
| `update-notifier` | Version update checker | `app.use(updateNotifierPlugin)` |
| `logger` | Leveled logging (debug, info, warn, error) | `app.use(loggerPlugin)` |
| `middleware` | Command middleware/hooks system | `app.use(middlewarePlugin)` |

---

## API DESIGN

### Main Export

```typescript
import { cli } from '@oxog/cli';

// Fluent Builder
const app = cli('myapp')
  .version('1.0.0')
  .description('My CLI application');

// Object Config
const app = cli({
  name: 'myapp',
  version: '1.0.0',
  description: 'My CLI application'
});

// Run the CLI
app.run();
app.run(process.argv.slice(2)); // Custom args
await app.runAsync(); // Async version
```

### Type Definitions

```typescript
/**
 * CLI application options
 */
export interface CLIOptions {
  /** Application name */
  name: string;
  /** Semantic version */
  version?: string;
  /** Application description */
  description?: string;
  /** Enable strict mode (fail on unknown options) */
  strict?: boolean;
  /** Custom help formatter */
  helpFormatter?: HelpFormatter;
  /** Custom error handler */
  errorHandler?: ErrorHandler;
  /** Initial plugins to load */
  plugins?: CLIPlugin[];
}

/**
 * Command definition
 */
export interface CommandDef {
  /** Command name */
  name: string;
  /** Command description */
  description?: string;
  /** Command aliases */
  aliases?: string[];
  /** Command arguments */
  arguments?: ArgumentDef[];
  /** Command options */
  options?: OptionDef[];
  /** Subcommands */
  commands?: CommandDef[];
  /** Action handler */
  action?: ActionHandler;
  /** Command-specific middleware */
  middleware?: Middleware[];
}

/**
 * Argument definition
 */
export interface ArgumentDef {
  /** Argument name */
  name: string;
  /** Description */
  description?: string;
  /** Is required */
  required?: boolean;
  /** Is variadic */
  variadic?: boolean;
  /** Default value */
  default?: unknown;
  /** Value validator */
  validate?: (value: unknown) => boolean | string;
  /** Value coercion */
  coerce?: (value: string) => unknown;
}

/**
 * Option definition
 */
export interface OptionDef {
  /** Long flag (e.g., "port") */
  name: string;
  /** Short flag (e.g., "p") */
  alias?: string;
  /** Description */
  description?: string;
  /** Value type */
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** Is required */
  required?: boolean;
  /** Default value */
  default?: unknown;
  /** Allowed values */
  choices?: unknown[];
  /** Value validator */
  validate?: (value: unknown) => boolean | string;
  /** Value coercion */
  coerce?: (value: string) => unknown;
  /** Is negatable (--no-xxx) */
  negatable?: boolean;
}

/**
 * Action handler context
 */
export interface ActionContext {
  /** Parsed arguments */
  args: Record<string, unknown>;
  /** Parsed options */
  options: Record<string, unknown>;
  /** Raw argv */
  argv: string[];
  /** Current command */
  command: Command;
  /** CLI application */
  app: CLI;
  /** Prompt utilities (if plugin enabled) */
  prompt: PromptUtils;
  /** Spinner utilities (if plugin enabled) */
  spinner: SpinnerUtils;
  /** Logger utilities (if plugin enabled) */
  logger: LoggerUtils;
}

/**
 * Action handler
 */
export type ActionHandler = (ctx: ActionContext) => void | Promise<void>;

/**
 * Middleware function
 */
export type Middleware = (
  ctx: ActionContext, 
  next: () => Promise<void>
) => void | Promise<void>;
```

---

## TECHNICAL REQUIREMENTS

| Requirement | Value |
|-------------|-------|
| Runtime | Node.js 18+, Deno, Bun (Universal ESM) |
| Module Format | ESM + CJS dual build |
| Node.js Version | >= 18 |
| TypeScript Version | >= 5.0 |
| Bundle Size (core) | < 5KB gzipped |
| Bundle Size (all plugins) | < 25KB gzipped |

---

## LLM-NATIVE REQUIREMENTS

### 1. llms.txt File

Create `/llms.txt` in project root (< 2000 tokens):

```markdown
# @oxog/cli

> Zero-dependency CLI framework with type-safe commands, beautiful output, and plugin architecture

## Install

```bash
npm install @oxog/cli
```

## Basic Usage

```typescript
import { cli } from '@oxog/cli';

const app = cli('myapp').version('1.0.0');
app.command('greet').argument('<name>').action(({ args }) => console.log(`Hello, ${args.name}!`));
app.run();
```

## API Summary

### Core
- `cli(name | options)` - Create CLI application
- `.version(v)` - Set version
- `.description(d)` - Set description
- `.command(name)` - Add command
- `.argument(def, desc?)` - Add argument
- `.option(flags, desc?, opts?)` - Add option
- `.action(handler)` - Set action handler
- `.use(plugin)` - Register plugin
- `.run(argv?)` - Execute CLI

### Core Plugins
- `help` - Auto-generated help output
- `version` - Version display
- `validation` - Type validation

### Optional Plugins
- `prompt` - Interactive prompts (input, select, confirm, password, autocomplete, wizard)
- `spinner` - Loading spinners & progress bars
- `color` - ANSI colorized output
- `table` - Table formatting
- `config` - Config file support (.json, .yaml, .toml, .env)
- `completion` - Shell autocompletion (bash, zsh, fish)
- `update-notifier` - Version update checker
- `logger` - Leveled logging
- `middleware` - Command middleware/hooks

## Common Patterns

### Basic Command
```typescript
app.command('init')
  .description('Initialize project')
  .argument('<name>', 'Project name')
  .option('-t, --template <type>', 'Template', 'default')
  .action(({ args, options }) => {
    console.log(`Creating ${args.name} with template ${options.template}`);
  });
```

### Interactive Prompt
```typescript
app.command('create')
  .action(async ({ prompt }) => {
    const name = await prompt.input({ message: 'Project name:' });
    const type = await prompt.select({
      message: 'Type:',
      choices: ['app', 'library', 'cli']
    });
  });
```

### With Spinner
```typescript
app.command('deploy')
  .action(async ({ spinner }) => {
    const s = spinner.start('Deploying...');
    await deploy();
    s.succeed('Deployed!');
  });
```

## Errors

| Code | Meaning | Solution |
|------|---------|----------|
| `UNKNOWN_COMMAND` | Command not found | Check command name, see help |
| `MISSING_ARGUMENT` | Required argument missing | Provide required argument |
| `INVALID_OPTION` | Invalid option value | Check option type/choices |
| `UNKNOWN_OPTION` | Unknown option | Check option name |
| `VALIDATION_ERROR` | Validation failed | Check value format |

## Links

- Docs: https://cli.oxog.dev
- GitHub: https://github.com/ersinkoc/cli
```

### 2. API Naming Standards

Use predictable patterns LLMs can infer:

```typescript
// ✅ GOOD - Predictable
cli()              // Factory function
.command()         // Add command
.argument()        // Add argument
.option()          // Add option
.action()          // Set handler
.use()             // Register plugin
.run()             // Execute
.parse()           // Parse args

// ❌ BAD - Unpredictable
init()
cmd()
arg()
opt()
exec()
go()
```

### 3. Example Categories

```
examples/
├── 01-basic/
│   ├── hello-world.ts           # Minimal CLI
│   ├── with-options.ts          # Options usage
│   └── subcommands.ts           # Nested commands
├── 02-api-styles/
│   ├── fluent-builder.ts        # Primary API
│   ├── object-config.ts         # Declarative API
│   └── decorators.ts            # Class-based API
├── 03-prompts/
│   ├── basic-prompts.ts         # input, confirm, select
│   ├── advanced-prompts.ts      # autocomplete, wizard
│   └── conditional-prompts.ts   # Branching logic
├── 04-output/
│   ├── colors.ts                # Colorized output
│   ├── tables.ts                # Table formatting
│   ├── spinners.ts              # Loading indicators
│   └── progress.ts              # Progress bars
├── 05-validation/
│   ├── type-validation.ts       # Built-in validators
│   ├── custom-validators.ts     # Custom rules
│   └── error-handling.ts        # Graceful errors
├── 06-real-world/
│   ├── git-clone.ts             # Git-like CLI
│   ├── npm-like.ts              # Package manager style
│   ├── docker-like.ts           # Docker-style commands
│   └── create-app.ts            # create-xxx scaffolder
```

### 4. JSDoc Requirements

Every public API must have:
- Description
- @param for each parameter
- @returns description
- @example with working code
- @default for optional parameters

```typescript
/**
 * Creates a new CLI application instance.
 * 
 * @param nameOrOptions - Application name or configuration object
 * @returns CLI application instance
 * 
 * @example
 * ```typescript
 * // With name
 * const app = cli('myapp');
 * 
 * // With options
 * const app = cli({
 *   name: 'myapp',
 *   version: '1.0.0',
 *   description: 'My CLI application'
 * });
 * ```
 */
export function cli(nameOrOptions: string | CLIOptions): CLI {
  // ...
}
```

---

## MCP SERVER

Create an MCP server for LLM integration:

### Tools

1. **cli_generate** - Generate CLI code from description
   - Input: `{ description: string, style?: 'fluent' | 'config' | 'decorator' }`
   - Output: Complete CLI code

2. **cli_explain** - Explain a CLI command structure
   - Input: `{ code: string }`
   - Output: Explanation of command structure

3. **cli_migrate** - Migrate from Commander.js
   - Input: `{ code: string }`
   - Output: Equivalent @oxog/cli code

### MCP Server Structure

```
mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # Server entry
│   ├── tools/
│   │   ├── generate.ts    # CLI generation
│   │   ├── explain.ts     # Code explanation
│   │   └── migrate.ts     # Migration tool
│   └── templates/
│       ├── fluent.ts      # Fluent builder template
│       ├── config.ts      # Object config template
│       └── decorator.ts   # Decorator template
└── README.md
```

---

## PROJECT STRUCTURE

```
cli/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Website deploy only
├── src/
│   ├── index.ts                    # Main entry, exports
│   ├── cli.ts                      # CLI class (fluent builder)
│   ├── kernel.ts                   # Micro kernel core
│   ├── types.ts                    # Type definitions (JSDoc rich!)
│   ├── parser/
│   │   ├── index.ts                # Parser entry
│   │   ├── tokenizer.ts            # Argv tokenizer
│   │   ├── arguments.ts            # Argument parser
│   │   └── options.ts              # Option parser
│   ├── command/
│   │   ├── index.ts                # Command exports
│   │   ├── command.ts              # Command class
│   │   ├── registry.ts             # Command registry
│   │   └── router.ts               # Command router
│   ├── api/
│   │   ├── fluent.ts               # Fluent builder API
│   │   ├── config.ts               # Object config API
│   │   └── decorators.ts           # Decorator API
│   ├── plugins/
│   │   ├── index.ts                # Plugin exports
│   │   ├── core/
│   │   │   ├── help.ts             # Help plugin
│   │   │   ├── version.ts          # Version plugin
│   │   │   └── validation.ts       # Validation plugin
│   │   └── optional/
│   │       ├── prompt/
│   │       │   ├── index.ts        # Prompt plugin entry
│   │       │   ├── input.ts        # Text input
│   │       │   ├── password.ts     # Password input
│   │       │   ├── confirm.ts      # Yes/No
│   │       │   ├── select.ts       # Single select
│   │       │   ├── multiselect.ts  # Multi select
│   │       │   ├── autocomplete.ts # Fuzzy search
│   │       │   ├── number.ts       # Number input
│   │       │   ├── date.ts         # Date picker
│   │       │   ├── editor.ts       # $EDITOR
│   │       │   └── wizard.ts       # Multi-step
│   │       ├── spinner/
│   │       │   ├── index.ts        # Spinner plugin entry
│   │       │   ├── spinner.ts      # Spinner class
│   │       │   └── progress.ts     # Progress bar
│   │       ├── color/
│   │       │   ├── index.ts        # Color plugin entry
│   │       │   ├── ansi.ts         # ANSI codes
│   │       │   └── styles.ts       # Color/style functions
│   │       ├── table/
│   │       │   ├── index.ts        # Table plugin entry
│   │       │   └── formatter.ts    # Table formatter
│   │       ├── config/
│   │       │   ├── index.ts        # Config plugin entry
│   │       │   ├── loader.ts       # Config loader
│   │       │   ├── json.ts         # JSON parser
│   │       │   ├── yaml.ts         # YAML parser
│   │       │   ├── toml.ts         # TOML parser
│   │       │   └── env.ts          # ENV parser
│   │       ├── completion/
│   │       │   ├── index.ts        # Completion plugin entry
│   │       │   ├── bash.ts         # Bash completion
│   │       │   ├── zsh.ts          # Zsh completion
│   │       │   └── fish.ts         # Fish completion
│   │       ├── update-notifier/
│   │       │   └── index.ts        # Update notifier
│   │       ├── logger/
│   │       │   └── index.ts        # Logger plugin
│   │       └── middleware/
│   │           └── index.ts        # Middleware plugin
│   ├── utils/
│   │   ├── index.ts                # Utils exports
│   │   ├── levenshtein.ts          # String distance
│   │   ├── fuzzy.ts                # Fuzzy search
│   │   ├── terminal.ts             # Terminal utils
│   │   └── ansi.ts                 # ANSI utils
│   └── errors/
│       ├── index.ts                # Error exports
│       └── cli-error.ts            # Custom errors
├── tests/
│   ├── unit/
│   │   ├── parser/
│   │   ├── command/
│   │   ├── plugins/
│   │   └── utils/
│   ├── integration/
│   │   ├── fluent-api.test.ts
│   │   ├── config-api.test.ts
│   │   └── decorator-api.test.ts
│   └── fixtures/
├── examples/                       # 18+ organized examples
│   ├── 01-basic/
│   ├── 02-api-styles/
│   ├── 03-prompts/
│   ├── 04-output/
│   ├── 05-validation/
│   └── 06-real-world/
├── mcp-server/                     # MCP server for LLM integration
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   └── tools/
│   └── README.md
├── website/                        # React + Vite → cli.oxog.dev
│   ├── public/
│   │   ├── CNAME                   # cli.oxog.dev
│   │   └── llms.txt                # Copied from root
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
├── llms.txt                        # LLM-optimized reference
├── SPECIFICATION.md                # Package spec (create first)
├── IMPLEMENTATION.md               # Architecture design (create second)
├── TASKS.md                        # Task breakdown (create third)
├── README.md                       # Human + LLM optimized
├── CHANGELOG.md
├── LICENSE
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── .gitignore
```

---

## WEBSITE SPECIFICATION

### Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Syntax Highlighting**: Prism React Renderer
- **Icons**: Lucide React
- **Domain**: cli.oxog.dev

### IDE-Style Code Blocks
All code blocks MUST have:
- Line numbers (muted, non-selectable)
- Syntax highlighting
- Header bar with filename/language
- Copy button with "Copied!" feedback
- Rounded corners, subtle border
- Dark/light theme support

### Theme System
- Dark mode (default)
- Light mode
- Toggle button in navbar
- Persist in localStorage
- Respect system preference on first visit

### Required Pages
1. **Home** - Hero, features, install, example
2. **Getting Started** - Installation, basic usage, API styles
3. **API Reference** - Complete documentation
4. **Examples** - Organized by category
5. **Plugins** - Core, optional, custom
6. **Playground** - Interactive code editor

### Footer
- Package name: @oxog/cli
- MIT License
- © 2025 Ersin Koç
- GitHub link only

---

## GITHUB ACTIONS

Single workflow file: `.github/workflows/deploy.yml`

```yaml
name: Deploy Website

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Build package
        run: npm run build
      
      - name: Build website
        working-directory: ./website
        run: |
          npm ci
          npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './website/dist'
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## CONFIG FILES

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/plugins/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'website/',
        'examples/',
        'mcp-server/',
        '*.config.*',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

### package.json

```json
{
  "name": "@oxog/cli",
  "version": "1.0.0",
  "description": "Zero-dependency CLI framework with type-safe commands, beautiful output, and plugin architecture",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
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
    },
    "./plugins": {
      "import": {
        "types": "./dist/plugins/index.d.ts",
        "default": "./dist/plugins/index.js"
      },
      "require": {
        "types": "./dist/plugins/index.d.cts",
        "default": "./dist/plugins/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test:coverage"
  },
  "keywords": [
    "cli",
    "command-line",
    "commander",
    "args",
    "parser",
    "terminal",
    "prompt",
    "interactive",
    "typescript",
    "zero-dependency",
    "plugin",
    "micro-kernel"
  ],
  "author": "Ersin Koç",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ersinkoc/cli.git"
  },
  "bugs": {
    "url": "https://github.com/ersinkoc/cli/issues"
  },
  "homepage": "https://cli.oxog.dev",
  "engines": {
    "node": ">=18"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

---

## IMPLEMENTATION CHECKLIST

### Before Starting
- [ ] Create SPECIFICATION.md with complete spec
- [ ] Create IMPLEMENTATION.md with architecture
- [ ] Create TASKS.md with ordered task list
- [ ] All three documents reviewed and complete

### During Implementation
- [ ] Follow TASKS.md sequentially
- [ ] Write tests before or with each feature
- [ ] Maintain 100% coverage throughout
- [ ] JSDoc on every public API with @example
- [ ] Create examples as features are built

### Package Completion
- [ ] All tests passing (100%)
- [ ] Coverage at 100% (lines, branches, functions)
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Package builds without errors

### LLM-Native Completion
- [ ] llms.txt created (< 2000 tokens)
- [ ] llms.txt copied to website/public/
- [ ] README first 500 tokens optimized
- [ ] All public APIs have JSDoc + @example
- [ ] 18+ examples in organized folders
- [ ] package.json has 12 keywords
- [ ] API uses standard naming patterns
- [ ] MCP server implemented

### Website Completion
- [ ] All pages implemented
- [ ] IDE-style code blocks with line numbers
- [ ] Copy buttons working
- [ ] Dark/Light theme toggle
- [ ] CNAME file with cli.oxog.dev
- [ ] Mobile responsive
- [ ] Footer with Ersin Koç, MIT, GitHub only

### Final Verification
- [ ] `npm run build` succeeds
- [ ] `npm run test:coverage` shows 100%
- [ ] Website builds without errors
- [ ] All examples run successfully
- [ ] README is complete and accurate
- [ ] MCP server works correctly

---

## BEGIN IMPLEMENTATION

Start by creating **SPECIFICATION.md** with the complete package specification based on everything above.

Then create **IMPLEMENTATION.md** with architecture decisions.

Then create **TASKS.md** with ordered, numbered tasks.

Only after all three documents are complete, begin implementing code by following TASKS.md sequentially.

**Remember:**
- This package will be published to npm
- It must be production-ready
- Zero runtime dependencies
- 100% test coverage
- Professionally documented
- LLM-native design
- Beautiful documentation website
- MCP server for AI integration
