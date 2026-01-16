# @oxog/cli Refactor - Ecosystem Integration

## Refactor Amacı

Mevcut `@oxog/cli` paketi standalone, zero-dependency olarak tasarlandı. Artık @oxog ekosisteminde ortak kullanılan core paketler mevcut. Bu refactor ile:

1. **@oxog/types** - Ortak tip tanımlamaları kullanılacak
2. **@oxog/plugin** - Plugin sistemi bu paketten alınacak
3. **@oxog/emitter** - Event sistemi bu paketten alınacak

Bu sayede:
- Kod tekrarı ortadan kalkacak
- Ekosistem tutarlılığı sağlanacak
- Diğer @oxog paketleriyle interoperability artacak
- Maintenance kolaylaşacak

---

## Bağımlılık Yapısı

### Önceki (Standalone)
```
@oxog/cli
├── (zero dependencies)
└── Kendi içinde: types, plugin system, event emitter
```

### Sonraki (Ecosystem Integrated)
```
@oxog/cli
├── @oxog/types (peer dependency)
├── @oxog/plugin (peer dependency)
├── @oxog/emitter (peer dependency)
└── (hala zero EXTERNAL dependencies - sadece @oxog/* kullanılır)
```

---

## Package Identity

| Field | Value |
|-------|-------|
| **NPM Package** | `@oxog/cli` |
| **GitHub Repository** | `https://github.com/ersinkoc/cli` |
| **Documentation Site** | `https://cli.oxog.dev` |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |

---

## Dependency Rules

### ✅ İZİN VERİLEN Bağımlılıklar

```json
{
  "peerDependencies": {
    "@oxog/types": "^1.0.0",
    "@oxog/plugin": "^1.0.0",
    "@oxog/emitter": "^1.0.0"
  },
  "devDependencies": {
    "@oxog/types": "^1.0.0",
    "@oxog/plugin": "^1.0.0",
    "@oxog/emitter": "^1.0.0",
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

### ❌ YASAK Bağımlılıklar

- Hiçbir external npm paketi (commander, inquirer, chalk, ora, etc.)
- Sadece `@oxog/*` namespace'i içindeki paketler kullanılabilir

---

## @oxog/types Kullanımı

`@oxog/types` paketinden alınacak ortak tipler:

```typescript
// @oxog/types'dan import edilecekler
import type {
  // Core types
  MaybePromise,
  MaybeArray,
  Prettify,
  DeepPartial,
  DeepRequired,
  
  // Function types
  AnyFunction,
  AsyncFunction,
  Callback,
  
  // Object types
  Dictionary,
  StringKeyOf,
  ValueOf,
  
  // Utility types
  Brand,
  Opaque,
  NonEmptyArray,
  Nullish
} from '@oxog/types';
```

### @oxog/cli Özel Tipleri

CLI'ya özel tipler `@oxog/cli` içinde kalacak ama `@oxog/types`'ı extend edecek:

```typescript
// src/types.ts
import type { MaybePromise, Dictionary, Prettify } from '@oxog/types';

/**
 * CLI application options
 */
export interface CLIOptions {
  name: string;
  version?: string;
  description?: string;
  strict?: boolean;
}

/**
 * Command definition
 */
export interface CommandDef {
  name: string;
  description?: string;
  aliases?: string[];
  arguments?: ArgumentDef[];
  options?: OptionDef[];
  commands?: CommandDef[];
  action?: ActionHandler;
}

/**
 * Action handler - uses MaybePromise from @oxog/types
 */
export type ActionHandler = (ctx: ActionContext) => MaybePromise<void>;

/**
 * Parsed arguments - uses Dictionary from @oxog/types
 */
export type ParsedArgs = Dictionary<unknown>;
```

---

## @oxog/plugin Kullanımı

`@oxog/plugin` paketinden alınacak plugin sistemi:

```typescript
// @oxog/plugin'dan import edilecekler
import {
  createPluginSystem,
  definePlugin,
  type Plugin,
  type PluginSystem,
  type PluginContext,
  type PluginLifecycle
} from '@oxog/plugin';
```

### @oxog/cli Plugin Adaptasyonu

```typescript
// src/plugin/index.ts
import { createPluginSystem, definePlugin, type Plugin } from '@oxog/plugin';
import type { CLIContext } from '../types';

/**
 * CLI-specific plugin type extending base Plugin
 */
export interface CLIPlugin extends Plugin<CLIContext> {
  /** CLI-specific: commands to register */
  commands?: CommandDef[];
  
  /** CLI-specific: global options to add */
  globalOptions?: OptionDef[];
  
  /** CLI-specific: middleware to apply */
  middleware?: Middleware[];
}

/**
 * Create CLI plugin system with CLI-specific context
 */
export function createCLIPluginSystem() {
  return createPluginSystem<CLIContext>({
    namespace: 'cli',
    
    // CLI-specific lifecycle hooks
    hooks: {
      'command:before': true,
      'command:after': true,
      'parse:before': true,
      'parse:after': true,
      'error': true
    }
  });
}

/**
 * Define a CLI plugin with type safety
 */
export function defineCLIPlugin(plugin: CLIPlugin): CLIPlugin {
  return definePlugin(plugin);
}
```

### Plugin Migration Örneği

**Önce (Standalone implementasyon):**
```typescript
// Eski: src/kernel.ts içinde custom plugin sistemi
class CLIKernel {
  private plugins: Map<string, CLIPlugin> = new Map();
  
  use(plugin: CLIPlugin) {
    this.plugins.set(plugin.name, plugin);
    plugin.install(this);
  }
  
  // ... custom implementation
}
```

**Sonra (@oxog/plugin kullanarak):**
```typescript
// Yeni: src/kernel.ts @oxog/plugin kullanıyor
import { createPluginSystem } from '@oxog/plugin';
import type { CLIContext, CLIPlugin } from './types';

class CLIKernel {
  private pluginSystem = createPluginSystem<CLIContext>({
    namespace: 'cli'
  });
  
  use(plugin: CLIPlugin) {
    return this.pluginSystem.register(plugin);
  }
  
  unuse(name: string) {
    return this.pluginSystem.unregister(name);
  }
  
  getPlugin(name: string) {
    return this.pluginSystem.get(name);
  }
  
  listPlugins() {
    return this.pluginSystem.list();
  }
}
```

---

## @oxog/emitter Kullanımı

`@oxog/emitter` paketinden alınacak event sistemi:

```typescript
// @oxog/emitter'dan import edilecekler
import {
  createEmitter,
  type Emitter,
  type EventMap,
  type EventHandler,
  type EmitterOptions
} from '@oxog/emitter';
```

### @oxog/cli Event Adaptasyonu

```typescript
// src/events.ts
import { createEmitter, type EventMap } from '@oxog/emitter';
import type { ActionContext, CLIError } from './types';

/**
 * CLI event map - all events that can be emitted
 */
export interface CLIEventMap extends EventMap {
  // Lifecycle events
  'cli:start': { args: string[] };
  'cli:end': { exitCode: number };
  
  // Command events
  'command:before': { command: string; context: ActionContext };
  'command:after': { command: string; context: ActionContext; result: unknown };
  'command:error': { command: string; error: CLIError };
  
  // Parse events
  'parse:before': { argv: string[] };
  'parse:after': { argv: string[]; parsed: ParsedArgs };
  
  // Plugin events
  'plugin:registered': { name: string };
  'plugin:unregistered': { name: string };
  
  // Prompt events (if prompt plugin enabled)
  'prompt:before': { type: string; options: unknown };
  'prompt:after': { type: string; value: unknown };
  'prompt:cancel': { type: string };
  
  // General
  'error': CLIError;
  'warn': { message: string; context?: unknown };
}

/**
 * Create CLI-specific emitter
 */
export function createCLIEmitter() {
  return createEmitter<CLIEventMap>({
    wildcard: true,     // Support 'command:*' patterns
    async: true,        // Async event handlers
    maxListeners: 100   // Reasonable limit
  });
}

export type CLIEmitter = ReturnType<typeof createCLIEmitter>;
```

### Emitter Migration Örneği

**Önce (Standalone implementasyon):**
```typescript
// Eski: src/kernel.ts içinde custom event sistemi
class CLIKernel {
  private listeners: Map<string, Set<Function>> = new Map();
  
  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }
  
  emit(event: string, data: unknown) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(h => h(data));
    }
  }
  
  // ... custom implementation
}
```

**Sonra (@oxog/emitter kullanarak):**
```typescript
// Yeni: src/kernel.ts @oxog/emitter kullanıyor
import { createEmitter } from '@oxog/emitter';
import { createCLIEmitter, type CLIEventMap } from './events';

class CLIKernel {
  private emitter = createCLIEmitter();
  
  on<K extends keyof CLIEventMap>(event: K, handler: (data: CLIEventMap[K]) => void) {
    return this.emitter.on(event, handler);
  }
  
  once<K extends keyof CLIEventMap>(event: K, handler: (data: CLIEventMap[K]) => void) {
    return this.emitter.once(event, handler);
  }
  
  off<K extends keyof CLIEventMap>(event: K, handler: (data: CLIEventMap[K]) => void) {
    return this.emitter.off(event, handler);
  }
  
  emit<K extends keyof CLIEventMap>(event: K, data: CLIEventMap[K]) {
    return this.emitter.emit(event, data);
  }
  
  // Wildcard support
  onAny(handler: (event: string, data: unknown) => void) {
    return this.emitter.on('*', handler);
  }
}
```

---

## Refactored Project Structure

```
cli/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── index.ts                    # Main entry, re-exports
│   ├── cli.ts                      # CLI class (fluent builder)
│   ├── kernel.ts                   # Micro kernel (uses @oxog/plugin, @oxog/emitter)
│   ├── types.ts                    # CLI-specific types (extends @oxog/types)
│   ├── events.ts                   # Event map definition
│   │
│   ├── parser/
│   │   ├── index.ts
│   │   ├── tokenizer.ts
│   │   ├── arguments.ts
│   │   └── options.ts
│   │
│   ├── command/
│   │   ├── index.ts
│   │   ├── command.ts
│   │   ├── registry.ts
│   │   └── router.ts
│   │
│   ├── api/
│   │   ├── fluent.ts               # Fluent builder API
│   │   ├── config.ts               # Object config API
│   │   └── decorators.ts           # Decorator API
│   │
│   ├── plugins/                    # All plugins use @oxog/plugin's definePlugin
│   │   ├── index.ts
│   │   ├── core/
│   │   │   ├── help.ts             # defineCLIPlugin({ name: 'help', ... })
│   │   │   ├── version.ts          # defineCLIPlugin({ name: 'version', ... })
│   │   │   └── validation.ts       # defineCLIPlugin({ name: 'validation', ... })
│   │   └── optional/
│   │       ├── prompt/
│   │       ├── spinner/
│   │       ├── color/
│   │       ├── table/
│   │       ├── config/
│   │       ├── completion/
│   │       ├── update-notifier/
│   │       ├── logger/
│   │       └── middleware/
│   │
│   ├── utils/
│   │   ├── index.ts
│   │   ├── levenshtein.ts
│   │   ├── fuzzy.ts
│   │   ├── terminal.ts
│   │   └── ansi.ts
│   │
│   └── errors/
│       ├── index.ts
│       └── cli-error.ts
│
├── tests/
├── examples/
├── mcp-server/
├── website/
├── llms.txt
├── SPECIFICATION.md
├── IMPLEMENTATION.md
├── TASKS.md
├── README.md
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

---

## Refactored Core Files

### src/kernel.ts

```typescript
/**
 * CLI Micro Kernel
 * 
 * Uses:
 * - @oxog/plugin for plugin management
 * - @oxog/emitter for event system
 * - @oxog/types for common type utilities
 */

import { createPluginSystem, type PluginSystem } from '@oxog/plugin';
import { createEmitter, type Emitter } from '@oxog/emitter';
import type { MaybePromise, Dictionary } from '@oxog/types';

import type { 
  CLIOptions, 
  CLIContext, 
  CLIPlugin,
  CLIEventMap 
} from './types';
import { CommandRegistry } from './command/registry';
import { CommandRouter } from './command/router';
import { Parser } from './parser';

/**
 * CLI Micro Kernel - minimal core with plugin architecture
 */
export class CLIKernel {
  readonly name: string;
  readonly version: string;
  
  // From @oxog/plugin
  private pluginSystem: PluginSystem<CLIContext>;
  
  // From @oxog/emitter
  private emitter: Emitter<CLIEventMap>;
  
  // CLI-specific
  private commandRegistry: CommandRegistry;
  private router: CommandRouter;
  private parser: Parser;
  
  constructor(options: CLIOptions) {
    this.name = options.name;
    this.version = options.version ?? '0.0.0';
    
    // Initialize @oxog/plugin system
    this.pluginSystem = createPluginSystem<CLIContext>({
      namespace: 'cli',
      strict: options.strict
    });
    
    // Initialize @oxog/emitter
    this.emitter = createEmitter<CLIEventMap>({
      wildcard: true,
      async: true
    });
    
    // Initialize CLI-specific components
    this.commandRegistry = new CommandRegistry();
    this.router = new CommandRouter(this.commandRegistry);
    this.parser = new Parser(options);
    
    // Load core plugins
    this.loadCorePlugins();
  }
  
  // ─────────────────────────────────────────────────────────────
  // Plugin System (delegated to @oxog/plugin)
  // ─────────────────────────────────────────────────────────────
  
  use(plugin: CLIPlugin): this {
    this.pluginSystem.register(plugin);
    
    // CLI-specific: register plugin's commands
    if (plugin.commands) {
      plugin.commands.forEach(cmd => this.commandRegistry.register(cmd));
    }
    
    // CLI-specific: register plugin's global options
    if (plugin.globalOptions) {
      plugin.globalOptions.forEach(opt => this.parser.addGlobalOption(opt));
    }
    
    this.emitter.emit('plugin:registered', { name: plugin.name });
    return this;
  }
  
  unuse(name: string): this {
    this.pluginSystem.unregister(name);
    this.emitter.emit('plugin:unregistered', { name });
    return this;
  }
  
  getPlugin(name: string): CLIPlugin | undefined {
    return this.pluginSystem.get(name) as CLIPlugin | undefined;
  }
  
  listPlugins(): string[] {
    return this.pluginSystem.list();
  }
  
  // ─────────────────────────────────────────────────────────────
  // Event System (delegated to @oxog/emitter)
  // ─────────────────────────────────────────────────────────────
  
  on<K extends keyof CLIEventMap>(
    event: K, 
    handler: (data: CLIEventMap[K]) => MaybePromise<void>
  ): () => void {
    return this.emitter.on(event, handler);
  }
  
  once<K extends keyof CLIEventMap>(
    event: K, 
    handler: (data: CLIEventMap[K]) => MaybePromise<void>
  ): () => void {
    return this.emitter.once(event, handler);
  }
  
  off<K extends keyof CLIEventMap>(
    event: K, 
    handler: (data: CLIEventMap[K]) => MaybePromise<void>
  ): void {
    this.emitter.off(event, handler);
  }
  
  protected emit<K extends keyof CLIEventMap>(
    event: K, 
    data: CLIEventMap[K]
  ): MaybePromise<void> {
    return this.emitter.emit(event, data);
  }
  
  // ─────────────────────────────────────────────────────────────
  // CLI-Specific Methods
  // ─────────────────────────────────────────────────────────────
  
  async run(argv: string[] = process.argv.slice(2)): Promise<void> {
    try {
      await this.emit('cli:start', { args: argv });
      await this.emit('parse:before', { argv });
      
      const parsed = this.parser.parse(argv);
      await this.emit('parse:after', { argv, parsed });
      
      const { command, context } = this.router.resolve(parsed);
      
      await this.emit('command:before', { command: command.name, context });
      
      const result = await command.action(context);
      
      await this.emit('command:after', { command: command.name, context, result });
      await this.emit('cli:end', { exitCode: 0 });
      
    } catch (error) {
      await this.emit('error', this.normalizeError(error));
      await this.emit('cli:end', { exitCode: 1 });
      process.exit(1);
    }
  }
  
  private loadCorePlugins(): void {
    // Core plugins are always loaded
    // They use defineCLIPlugin from our adapted plugin system
  }
  
  private normalizeError(error: unknown): CLIError {
    // Convert unknown errors to CLIError
  }
}
```

### src/types.ts

```typescript
/**
 * CLI Type Definitions
 * 
 * Extends @oxog/types with CLI-specific types
 */

import type { 
  MaybePromise, 
  MaybeArray, 
  Dictionary, 
  Prettify,
  AnyFunction 
} from '@oxog/types';

import type { Plugin, PluginContext } from '@oxog/plugin';
import type { EventMap } from '@oxog/emitter';

// ─────────────────────────────────────────────────────────────
// CLI Core Types
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Command Types
// ─────────────────────────────────────────────────────────────

export interface CommandDef {
  name: string;
  description?: string;
  aliases?: MaybeArray<string>;
  arguments?: ArgumentDef[];
  options?: OptionDef[];
  commands?: CommandDef[];
  action?: ActionHandler;
  middleware?: Middleware[];
}

export interface ArgumentDef {
  name: string;
  description?: string;
  required?: boolean;
  variadic?: boolean;
  default?: unknown;
  validate?: Validator;
  coerce?: Coercer;
}

export interface OptionDef {
  name: string;
  alias?: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  default?: unknown;
  choices?: unknown[];
  validate?: Validator;
  coerce?: Coercer;
  negatable?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────

export interface CLIContext extends PluginContext {
  /** Parsed arguments */
  args: Dictionary<unknown>;
  /** Parsed options */
  options: Dictionary<unknown>;
  /** Raw argv */
  argv: string[];
  /** Current command */
  command: Command;
  /** CLI application */
  app: CLI;
  /** Prompt utilities (if plugin enabled) */
  prompt?: PromptUtils;
  /** Spinner utilities (if plugin enabled) */
  spinner?: SpinnerUtils;
  /** Logger utilities (if plugin enabled) */
  logger?: LoggerUtils;
}

export interface ActionContext extends CLIContext {}

// ─────────────────────────────────────────────────────────────
// Handler Types (using @oxog/types)
// ─────────────────────────────────────────────────────────────

export type ActionHandler = (ctx: ActionContext) => MaybePromise<void>;

export type Middleware = (
  ctx: ActionContext, 
  next: () => MaybePromise<void>
) => MaybePromise<void>;

export type Validator = (value: unknown) => boolean | string;

export type Coercer = (value: string) => unknown;

export type HelpFormatter = (command: Command) => string;

export type ErrorHandler = (error: CLIError) => MaybePromise<void>;

// ─────────────────────────────────────────────────────────────
// Plugin Types (extending @oxog/plugin)
// ─────────────────────────────────────────────────────────────

export interface CLIPlugin extends Plugin<CLIContext> {
  /** CLI-specific: commands to register */
  commands?: CommandDef[];
  /** CLI-specific: global options to add */
  globalOptions?: OptionDef[];
  /** CLI-specific: middleware to apply */
  middleware?: Middleware[];
}

// ─────────────────────────────────────────────────────────────
// Event Types (extending @oxog/emitter)
// ─────────────────────────────────────────────────────────────

export interface CLIEventMap extends EventMap {
  'cli:start': { args: string[] };
  'cli:end': { exitCode: number };
  'command:before': { command: string; context: ActionContext };
  'command:after': { command: string; context: ActionContext; result: unknown };
  'command:error': { command: string; error: CLIError };
  'parse:before': { argv: string[] };
  'parse:after': { argv: string[]; parsed: ParsedArgs };
  'plugin:registered': { name: string };
  'plugin:unregistered': { name: string };
  'error': CLIError;
}

// ─────────────────────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────────────────────

export interface CLIError extends Error {
  code: CLIErrorCode;
  command?: string;
  context?: Dictionary<unknown>;
}

export type CLIErrorCode =
  | 'UNKNOWN_COMMAND'
  | 'MISSING_ARGUMENT'
  | 'INVALID_OPTION'
  | 'UNKNOWN_OPTION'
  | 'VALIDATION_ERROR'
  | 'PLUGIN_ERROR'
  | 'INTERNAL_ERROR';

// ─────────────────────────────────────────────────────────────
// Parsed Types
// ─────────────────────────────────────────────────────────────

export type ParsedArgs = Dictionary<unknown>;

export interface ParseResult {
  command: string[];
  args: ParsedArgs;
  options: Dictionary<unknown>;
  rest: string[];
}
```

### src/plugins/core/help.ts

```typescript
/**
 * Help Plugin
 * 
 * Uses defineCLIPlugin from adapted @oxog/plugin
 */

import { defineCLIPlugin } from '../index';
import type { CLIContext, Command } from '../../types';

export const helpPlugin = defineCLIPlugin({
  name: 'help',
  version: '1.0.0',
  
  // Adds --help, -h global option
  globalOptions: [
    {
      name: 'help',
      alias: 'h',
      type: 'boolean',
      description: 'Show help'
    }
  ],
  
  // Adds help command
  commands: [
    {
      name: 'help',
      description: 'Show help for a command',
      arguments: [
        { name: 'command', description: 'Command to show help for', required: false }
      ],
      action: ({ args, app }) => {
        const commandName = args.command as string | undefined;
        if (commandName) {
          showCommandHelp(app, commandName);
        } else {
          showGeneralHelp(app);
        }
      }
    }
  ],
  
  install(kernel) {
    // Listen for --help flag on any command
    kernel.on('command:before', ({ context }) => {
      if (context.options.help) {
        showCommandHelp(context.app, context.command.name);
        process.exit(0);
      }
    });
  }
});

function showGeneralHelp(app: CLI): void {
  // Generate and display general help
}

function showCommandHelp(app: CLI, commandName: string): void {
  // Generate and display command-specific help
}
```

---

## Package.json

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
  "peerDependencies": {
    "@oxog/types": "^1.0.0",
    "@oxog/plugin": "^1.0.0",
    "@oxog/emitter": "^1.0.0"
  },
  "devDependencies": {
    "@oxog/types": "^1.0.0",
    "@oxog/plugin": "^1.0.0",
    "@oxog/emitter": "^1.0.0",
    "@types/node": "^20.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
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
  }
}
```

---

## Migration Checklist

### Phase 1: Setup Dependencies

- [ ] Add @oxog/types as peer dependency
- [ ] Add @oxog/plugin as peer dependency
- [ ] Add @oxog/emitter as peer dependency
- [ ] Update tsconfig.json paths if needed
- [ ] Verify all @oxog/* packages are compatible

### Phase 2: Type Migration

- [ ] Remove custom type utilities (use @oxog/types instead)
- [ ] Update imports to use @oxog/types
- [ ] Extend @oxog/types with CLI-specific types
- [ ] Update all type references across codebase

### Phase 3: Plugin System Migration

- [ ] Remove custom plugin implementation from kernel
- [ ] Import createPluginSystem from @oxog/plugin
- [ ] Adapt CLIPlugin interface to extend Plugin
- [ ] Create defineCLIPlugin helper
- [ ] Migrate all core plugins to new format
- [ ] Migrate all optional plugins to new format
- [ ] Update plugin tests

### Phase 4: Event System Migration

- [ ] Remove custom event emitter from kernel
- [ ] Import createEmitter from @oxog/emitter
- [ ] Define CLIEventMap interface
- [ ] Update all event emissions
- [ ] Update all event listeners
- [ ] Update event-related tests

### Phase 5: Integration Testing

- [ ] Test plugin registration/unregistration
- [ ] Test event emission/listening
- [ ] Test type inference
- [ ] Test all three API styles (fluent, config, decorators)
- [ ] Test all core plugins
- [ ] Test all optional plugins

### Phase 6: Documentation Update

- [ ] Update README with new peer dependencies
- [ ] Update API documentation
- [ ] Update plugin development guide
- [ ] Update llms.txt
- [ ] Update website

---

## Benefits of This Refactor

1. **Code Reuse**: Plugin and event systems shared across @oxog ecosystem
2. **Type Safety**: Centralized types ensure consistency
3. **Maintenance**: Bug fixes in @oxog/plugin benefit all packages
4. **Interoperability**: CLI plugins compatible with other @oxog packages
5. **Bundle Size**: Tree-shaking works better with separate packages
6. **Testing**: Core systems tested independently
7. **Documentation**: Unified documentation patterns

---

## BEGIN REFACTOR

1. First, ensure @oxog/types, @oxog/plugin, and @oxog/emitter are published and stable
2. Create a new branch: `git checkout -b refactor/ecosystem-integration`
3. Follow the Migration Checklist above
4. Run full test suite after each phase
5. Update documentation
6. Create PR for review

**Remember:**
- All @oxog/* packages are zero-dependency themselves
- CLI-specific logic stays in @oxog/cli
- Only common, reusable code comes from @oxog/* packages
- 100% test coverage must be maintained
- All existing features must continue to work
