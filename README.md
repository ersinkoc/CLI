# @oxog/cli

> Modern, type-safe CLI framework with zero runtime dependencies, plugin architecture, and beautiful output

[![npm version](https://badge.fury.io/js/%40oxog%2Fcli.svg)](https://www.npmjs.com/package/@oxog/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/ersinkoc/oxog-cli)

**@oxog/cli** is a comprehensive command-line interface framework designed for modern TypeScript applications. It provides a fluent builder API, full TypeScript support, built-in spinner and logging utilities, and a micro-kernel plugin architecture. **Zero runtime dependencies** — every foundation is implemented in this package.

## ✨ Features

- **Zero Dependencies** - No runtime, peer, or transitive dependencies; everything is built in
- **Full TypeScript Support** - Type-safe commands, arguments, and options with built-in utility types
- **Plugin Architecture** - Micro-kernel design with dependency resolution
- **Event-Driven** - Built-in type-safe emitter with wildcard and pattern support
- **Beautiful Output** - Built-in colors, spinners, progress bars, and structured logging
- **Robust Parsing** - Advanced argument parsing with validation and coercion
- **Nested Commands** - Support for complex command hierarchies
- **Middleware System** - Pre/post-processing hooks for commands
- **AI-Native Design** - Optimized for both humans and AI assistants

## 📦 Installation

```bash
npm install @oxog/cli
```

> **Zero dependencies.** @oxog/cli ships with its own event emitter, color
> engine, and utility types — no peer dependencies, no transitive installs.
> Everything (typing, parsing, kernel, prompts, styling) is implemented
> in this package from scratch.

## 🚀 Quick Start

```typescript
import { cli } from '@oxog/cli';

const app = cli('myapp').version('1.0.0').describe('My awesome CLI application');

app
  .command('greet')
  .describe('Greet someone')
  .argument('<name>', 'Name of the person to greet')
  .option('--loud', 'Shout the greeting')
  .action(({ args, options }) => {
    const message = `Hello, ${args.name}!`;
    console.log(options.loud ? message.toUpperCase() : message);
  });

app.run();
```

## 🔌 Plugins

Enhance your CLI with powerful plugins:

```typescript
import { cli } from '@oxog/cli';
import { colorPlugin, spinnerPlugin, loggerPlugin } from '@oxog/cli/plugins';

const app = cli('myapp')
  .use(colorPlugin()) // Beautiful colored output
  .use(spinnerPlugin()) // Loading spinners
  .use(loggerPlugin()); // Structured logging

app
  .command('deploy')
  .describe('Deploy to production')
  .action(async ({ spinner, logger }) => {
    const spin = spinner.start('Deploying...');
    logger.info('Starting deployment...');

    await deploy();

    spin.succeed('Deployed!');
    logger.info('Deployment complete!');
  });
```

## 📚 Documentation

- [Getting Started Guide](docs/IMPLEMENTATION.md)
- [API Reference](docs/SPECIFICATION.md)
- [Plugin Development](docs/TASKS.md)
- [Examples](./examples)

### Available Plugins

**Core Plugins:**

- **helpPlugin** - Automatic help text generation
- **versionPlugin** - Version display support
- **validationPlugin** - Argument and option validation

**Optional Plugins:**

- **colorPlugin** - Terminal styling with the built-in chainable pigment API (Chalk-compatible)
- **spinnerPlugin** - Elegant loading indicators
- **loggerPlugin** - Structured logging with levels
- **middlewarePlugin** - Command middleware support
- **promptPlugin** - Interactive prompts (input, select, confirm, etc.)
- **progressPlugin** - Progress bars with ETA and rate display
- **tablePlugin** - Formatted table output with multiple border styles
- **configPlugin** - Config file support (JSON, YAML, TOML, .env)
- **completionPlugin** - Shell completion generation (bash, zsh, fish)

## 🔩 Built-in Foundations (Zero-Dependency)

@oxog/cli implements its own foundations — no ecosystem packages required:

```typescript
// Type utilities (built-in)
import type {
  MaybePromise,
  DeepPartial,
  DeepReadonly,
  Unsubscribe,
  JsonValue,
  EventMap,
} from '@oxog/cli';

// Event emitter (built-in)
import { Emitter, createEmitter } from '@oxog/cli';

// Terminal styling (built-in chainable API)
import { createPigment } from '@oxog/cli/plugins';

const pigment = createPigment();
console.log(pigment.red.bold('Error!'));
```

### Using Terminal Styling

The color plugin provides the built-in chainable pigment API for beautiful terminal output:

```typescript
import { cli } from '@oxog/cli';
import { colorPlugin } from '@oxog/cli/plugins';

const app = cli('myapp').use(colorPlugin());

app.command('status').action(({ pigment, color }) => {
  // Built-in pigment chainable API (recommended)
  console.log(pigment.red.bold('Error!'));
  console.log(pigment.green.italic('Success!'));
  console.log(pigment.hex('#ff6600').underline('Custom color'));

  // Legacy API (backward compatible)
  console.log(color.red('Error'));
  console.log(color.green('Success'));
});
```

### Using the Event System

The kernel uses @oxog/emitter internally for event handling:

```typescript
import { cli } from '@oxog/cli';

const app = cli('myapp');

// Subscribe to events
app.kernel.on('command:before', (data) => {
  console.log('Running command:', data);
});

// Emit custom events
await app.kernel.emit('custom:event', { foo: 'bar' });
```

## 🛠️ Library Mode

When using @oxog/cli as a library (e.g., inside Electron or a server), you can disable automatic `process.exit()`:

```typescript
import { cli, ExitRequest, HelpRequestedExit } from '@oxog/cli';

const app = cli({
  name: 'myapp',
  exitOnError: false, // Don't call process.exit()
});

try {
  await app.runAsync(['--help']);
} catch (error) {
  if (error instanceof HelpRequestedExit) {
    // Help was displayed, handle gracefully
  } else if (error instanceof ExitRequest) {
    // Version or other clean exit
  } else {
    // Actual error
    console.error(error);
  }
}
```

## 🧪 Testing

The project has 100% test coverage with 667 passing tests.

```bash
npm test
npm run test:coverage
```

## 🏗️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Watch mode
npm run dev
```

## 📝 License

MIT © 2026 [Ersin Koç](https://github.com/ersinkoc)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
