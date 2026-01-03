# @oxog/cli - Package Specification

## Version: 1.0.0
## Status: Final Specification
## Author: Ersin Koç

---

## 1. Package Identity

| Property | Value |
|----------|-------|
| **Name** | `@oxog/cli` |
| **Version** | `1.0.0` |
| **Description** | Zero-dependency CLI framework with type-safe commands, beautiful output, and plugin architecture |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |
| **Repository** | https://github.com/ersinkoc/cli |
| **Website** | https://cli.oxog.dev |
| **Runtime** | Node.js 18+, Deno, Bun |
| **Module Format** | ESM + CJS dual build |

---

## 2. Purpose and Goals

### 2.1 Primary Purpose
Create a comprehensive CLI framework that:
- Surpasses Commander.js in features and developer experience
- Requires ZERO runtime dependencies
- Provides three distinct API styles for different preferences
- Offers full TypeScript support with end-to-end type inference
- Includes built-in interactive prompts, colors, spinners, tables
- Uses a micro-kernel plugin architecture for extensibility

### 2.2 Design Goals
1. **Zero Dependencies**: Implement everything from scratch (ANSI parser, prompts, argument parsing)
2. **Type Safety**: Full TypeScript support with strict mode and comprehensive type inference
3. **Developer Experience**: Multiple API styles, rich JSDoc, excellent error messages
4. **Extensibility**: Micro-kernel architecture with plugin system
5. **Testing**: 100% test coverage requirement
6. **LLM-Native**: Optimized for both humans and AI assistants

---

## 3. Non-Negotiable Requirements

### 3.1 Dependencies
```json
{
  "dependencies": {},
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

### 3.2 Test Coverage
- 100% line coverage
- 100% branch coverage
- 100% function coverage
- All tests must pass

### 3.3 TypeScript Configuration
- Strict mode enabled
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- Module: ESNext
- Target: ES2022

---

## 4. Feature Specification

### 4.1 Three API Styles

#### Fluent Builder API (Primary)
```typescript
import { cli } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')
  .description('My awesome CLI')
  .command('init')
    .description('Initialize a new project')
    .argument('<name>', 'Project name')
    .option('-t, --template <type>', 'Template to use', 'default')
    .action(async ({ args, options, prompt, spinner }) => {
      // Implementation
    });

app.run();
```

#### Object Config API
```typescript
import { cli } from '@oxog/cli';

const app = cli({
  name: 'myapp',
  version: '1.0.0',
  description: 'My awesome CLI',
  commands: {
    init: {
      description: 'Initialize a new project',
      arguments: {
        name: { type: 'string', required: true, description: 'Project name' }
      },
      options: {
        template: { type: 'string', alias: 't', default: 'default' }
      },
      action: async (ctx) => { /* ... */ }
    }
  }
});

app.run();
```

#### Decorator API
```typescript
import { CLI, Command, Argument, Option } from '@oxog/cli';

@CLI({ name: 'myapp', version: '1.0.0' })
class MyApp {
  @Command('init', { description: 'Initialize a new project' })
  async init(
    @Argument('name') name: string,
    @Option('template', { alias: 't', default: 'default' }) template: string
  ) {
    // Implementation
  }
}

new MyApp().run();
```

### 4.2 Command System

#### Command Features
- Nested subcommands with parent navigation
- Command aliases (multiple per command)
- Global and command-specific options
- Command middleware support
- Automatic help generation
- "Did you mean?" suggestions

#### Command Syntax
```typescript
// Positional arguments
.argument('<required>', 'Description')
.argument('[optional]', 'Description')
.argument('<variadic...>', 'Description')
.argument('[variadic...]', 'Description')

// Options
.option('-s, --short <value>', 'Description')
.option('--long <value>', 'Description', { default: 'value' })
.option('--negatable', 'Description', { negatable: true })
.option('-v, --values <items...>', 'Description', { type: 'array' })
```

### 4.3 Argument & Option Parsing

#### Argument Types
- String: `<name>` or `[name]`
- Number: `<count:number>` with coercion
- Variadic: `<files...>` or `[files...]`

#### Option Types
- String: `--name <value>`
- Number: `--port <number>` with auto-coercion
- Boolean: `--flag` (true) or `--no-flag` (false)
- Array: `--files <file1> <file2>...`
- Object: `--define <key=value>...`

#### Validation
- Type validation (string, number, boolean, array, object)
- Choice validation: `choices: ['a', 'b', 'c']`
- Custom validators: `validate: (value) => boolean | string`
- Coercion: `coerce: (value) => any`

### 4.4 Interactive Prompts

#### Prompt Types
1. **Input**: Text input with default value
2. **Password**: Hidden text input
3. **Confirm**: Yes/No confirmation
4. **Select**: Single choice from list
5. **MultiSelect**: Multiple choices from list
6. **Autocomplete**: Search with fuzzy matching
7. **Number**: Numeric input with min/max/step
8. **Date**: Date picker with format
9. **Editor**: Opens $EDITOR for long text
10. **Wizard**: Multi-step conditional prompts

#### Prompt API
```typescript
const result = await prompt.input({
  message: 'Your name:',
  default: 'Anonymous',
  validate: (v) => v.length > 0 || 'Name required'
});

const choice = await prompt.select({
  message: 'Choose:',
  choices: [
    { value: 'a', label: 'Option A', hint: 'Description' },
    { value: 'b', label: 'Option B' }
  ]
});
```

### 4.5 Output Formatting

#### Colors
```typescript
color.red('text')
color.green.bold('text')
color.bgBlue.white('text')
color.hex('#ff6600')('text')
color.rgb(255, 100, 0)('text')
```

#### Spinners
```typescript
const spin = spinner.start('Loading...');
spin.text = 'Still loading...';
spin.succeed('Done!');
spin.fail('Failed!');
spin.warn('Warning');
spin.info('Info');
```

#### Progress Bars
```typescript
const bar = progress.create({ total: 100 });
bar.update(50);
bar.increment(10);
bar.stop();
```

#### Tables
```typescript
console.log(table(data, {
  columns: ['name', 'age', 'city'],
  header: true,
  border: 'rounded' // 'none', 'single', 'double', 'rounded'
}));
```

### 4.6 Config File Support

#### Supported Formats
- JSON: `app.config.json`, `.apprc`
- YAML: `.apprc.yaml`, `.apprc.yml`
- TOML: `.apprc.toml`
- JS: `app.config.js`
- ENV: `.env`
- package.json: `appName` config key

#### Features
- Auto-detection from search paths
- Environment variable overrides
- Default values merging
- Config validation

### 4.7 Shell Completion

#### Supported Shells
- Bash
- Zsh
- Fish

#### Features
- Command completion
- Option completion
- Argument completion for specific commands
- Automatic script generation

### 4.8 Additional Features

#### Update Notifier
Check for package updates with configurable intervals

#### Logger
Leveled logging: debug, info, warn, error

#### Middleware
Command middleware for auth, logging, analytics

#### Error Handling
Rich error messages with suggestions
Did you mean? for typos
Stack trace filtering

---

## 5. Plugin System Specification

### 5.1 Plugin Interface

```typescript
interface CLIPlugin<TContext = CLIContext> {
  name: string;
  version: string;
  dependencies?: string[];
  install: (kernel: CLIKernel<TContext>) => void;
  onInit?: (context: TContext) => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}
```

### 5.2 Core Plugins (Always Loaded)

| Plugin | Description |
|--------|-------------|
| help | Auto-generated help with colors and examples |
| version | Version display (--version, -V) |
| validation | Type validation for args and options |

### 5.3 Optional Plugins

| Plugin | Description |
|--------|-------------|
| prompt | Interactive prompts (input, select, confirm, etc.) |
| spinner | Loading spinners and progress bars |
| color | ANSI colorized output |
| table | Table formatting with borders |
| config | Config file support (.json, .yaml, .toml, .env) |
| completion | Shell autocompletion (bash, zsh, fish) |
| update-notifier | Version update checker |
| logger | Leveled logging (debug, info, warn, error) |
| middleware | Command middleware/hooks system |

### 5.4 Micro-Kernel Architecture

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

#### Kernel Responsibilities
1. Command registration and routing
2. Argument/option parsing (basic tokenization)
3. Plugin registration and lifecycle
4. Event bus for inter-plugin communication
5. Error boundary and recovery
6. Configuration management

---

## 6. Type System Specification

### 6.1 Core Types

```typescript
// CLI Application
interface CLIOptions {
  name: string;
  version?: string;
  description?: string;
  strict?: boolean;
  helpFormatter?: HelpFormatter;
  errorHandler?: ErrorHandler;
  plugins?: CLIPlugin[];
}

// Command
interface CommandDef {
  name: string;
  description?: string;
  aliases?: string[];
  arguments?: ArgumentDef[];
  options?: OptionDef[];
  commands?: CommandDef[];
  action?: ActionHandler;
  middleware?: Middleware[];
}

// Argument
interface ArgumentDef {
  name: string;
  description?: string;
  required?: boolean;
  variadic?: boolean;
  default?: unknown;
  validate?: (value: unknown) => boolean | string;
  coerce?: (value: string) => unknown;
}

// Option
interface OptionDef {
  name: string;
  alias?: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  default?: unknown;
  choices?: unknown[];
  validate?: (value: unknown) => boolean | string;
  coerce?: (value: string) => unknown;
  negatable?: boolean;
}

// Action Context
interface ActionContext {
  args: Record<string, unknown>;
  options: Record<string, unknown>;
  argv: string[];
  command: Command;
  app: CLI;
  prompt?: PromptUtils;
  spinner?: SpinnerUtils;
  logger?: LoggerUtils;
}

type ActionHandler = (ctx: ActionContext) => void | Promise<void>;
type Middleware = (ctx: ActionContext, next: () => Promise<void>) => void | Promise<void>;
```

---

## 7. Bundle Size Targets

| Component | Target Size |
|-----------|-------------|
| Core kernel | < 5KB gzipped |
| All plugins | < 25KB gzipped |
| Total (tree-shakeable) | < 30KB gzipped |

---

## 8. Performance Requirements

- Startup time: < 50ms for typical CLI
- Parse time: < 5ms for 100 arguments
- Help generation: < 10ms
- Prompt rendering: < 16ms (60fps)

---

## 9. Platform Support

### 9.1 Runtimes
- Node.js 18+
- Deno 1.35+
- Bun 1.0+

### 9.2 Platforms
- Linux (x64, arm64)
- macOS (x64, arm64)
- Windows (x64, x64)

### 9.3 Terminals
- All modern terminals with ANSI support
- Fallback for basic terminals
- Windows Terminal, cmd.exe, PowerShell

---

## 10. Testing Strategy

### 10.1 Unit Tests
- Every function tested
- Every branch covered
- Edge cases included
- Error scenarios tested

### 10.2 Integration Tests
- API style tests (fluent, config, decorator)
- End-to-end command execution
- Plugin interaction
- Error handling flows

### 10.3 Coverage Requirements
```
Lines:     100%
Functions: 100%
Branches:  100%
Statements: 100%
```

---

## 11. Documentation Requirements

### 11.1 Code Documentation
- JSDoc on every public export
- @param for all parameters
- @returns description
- @example with working code
- @default for optional params

### 11.2 LLM Optimization
- llms.txt file (< 2000 tokens)
- Predictable API naming
- Rich examples (18+ organized)
- README first 500 tokens optimized

### 11.3 Website
- Full documentation at cli.oxog.dev
- Interactive examples
- API reference
- Plugin development guide

---

## 12. Success Criteria

The package is considered complete when:

1. ✅ Zero runtime dependencies
2. ✅ 100% test coverage (all tests passing)
3. ✅ Three API styles working
4. ✅ All core features implemented
5. ✅ All plugins working
6. ✅ 18+ examples created
7. ✅ llms.txt created
8. ✅ MCP server working
9. ✅ Website deployed to cli.oxog.dev
10. ✅ TypeScript strict mode with no errors
11. ✅ All JSDoc complete with examples
12. ✅ Bundle size targets met

---

## 13. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | TBD | Initial release |

---

**End of Specification**
