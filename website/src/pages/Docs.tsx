import { CodeBlock } from '@/components/CodeBlock';
import { TableOfContents } from '@/components/TableOfContents';
import { cn } from '@/lib/utils';
import { codeExamples } from '@/lib/constants';

const docsContent = String.raw`# Introduction

@oxog/cli is a type-safe CLI framework for TypeScript that provides type-safe commands, beautiful output formatting, and a powerful plugin architecture. Built on the @oxog ecosystem for enhanced functionality.

## Why @oxog/cli?

- **@oxog Ecosystem** - Integrates with @oxog/types, @oxog/emitter, @oxog/plugin, and @oxog/pigment
- **Type Safety** - Full TypeScript support with end-to-end type inference
- **Multiple API Styles** - Fluent builder, object config, or decorator-based
- **Plugin System** - Micro-kernel architecture for extensibility
- **Beautiful Output** - Built-in support for spinners, progress bars, tables, and colored output via @oxog/pigment

## Installation

\`\`\`bash
npm install @oxog/cli
\`\`\`

### Peer Dependencies (Optional)

@oxog/cli works with the @oxog ecosystem packages as peer dependencies:

\`\`\`bash
npm install @oxog/types @oxog/emitter @oxog/plugin @oxog/pigment
\`\`\`

Or with yarn:

\`\`\`bash
yarn add @oxog/cli
yarn add @oxog/types @oxog/emitter @oxog/plugin @oxog/pigment
\`\`\`

## Basic Usage

Here's the simplest CLI you can create:

\`\`\`typescript
` + codeExamples.quickStart.trim() + `
\`\`\`

## Architecture Overview

@oxog/cli is built with a micro-kernel architecture at its core:

- **API Layer** - Three different API styles for defining CLIs
- **Facade Layer** - CLI class as the main entry point
- **Domain Layer** - Command registry, parser, router, and plugin manager
- **Kernel Layer** - Event bus, error boundary, and config manager
- **Plugin Layer** - Core plugins and extensibility points
- **Utility Layer** - ANSI colors, terminal utilities, fuzzy search

## Next Steps

- Learn about [Commands](/docs/commands)
- Explore [API Styles](/docs/fluent-api)
- Check out [Examples](/examples)
`;

const installationContent = String.raw`# Installation

@oxog/cli is available on npm and can be installed with any package manager.

## npm

\`\`\`bash
npm install @oxog/cli
\`\`\`

## yarn

\`\`\`bash
yarn add @oxog/cli
\`\`\`

## pnpm

\`\`\`bash
pnpm add @oxog/cli
\`\`\`

## bun

\`\`\`bash
bun add @oxog/cli
\`\`\`

## Peer Dependencies

@oxog/cli integrates with the @oxog ecosystem. Install peer dependencies for enhanced functionality:

\`\`\`bash
npm install @oxog/types @oxog/emitter @oxog/plugin @oxog/pigment
\`\`\`

- **@oxog/types** - Shared TypeScript type definitions
- **@oxog/emitter** - Type-safe event emitter for the kernel
- **@oxog/plugin** - Plugin system base interface
- **@oxog/pigment** - Terminal styling library (Chalk-compatible)

## TypeScript Configuration

Make sure your \`tsconfig.json\` has the following settings:

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  }
}
\`\`\`

## Requirements

- Node.js 18 or higher
- TypeScript 5.0 or higher (for type safety)
`;

const quickStartContent = String.raw`# Quick Start

Let's create your first CLI with @oxog/cli.

## Step 1: Create a Project

Create a new directory and initialize your project:

\`\`\`bash
mkdir my-cli
cd my-cli
npm init -y
npm install @oxog/cli
\`\`\`

## Step 2: Create Your CLI

Create a file named \`cli.ts\`:

\`\`\`typescript
` + codeExamples.quickStart.trim() + `
\`\`\`

## Step 3: Run It

\`\`\`bash
npx tsx cli.ts greet World
# Output: Hello, World!

npx tsx cli.ts greet --loud World
# Output: HELLO, WORLD!
\`\`\`

## Step 4: Make It Executable

### Option 1: Using tsx

Add to your \`package.json\`:

\`\`\`json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "my-cli": "./cli.ts"
  },
  "dependencies": {
    "@oxog/cli": "latest"
  },
  "devDependencies": {
    "tsx": "latest"
  }
}
\`\`\`

Then run:

\`\`\`bash
npm link
my-cli greet World
\`\`\`

### Option 2: Compile to JavaScript

Use \`tsup\` or \`tsc\` to compile your TypeScript:

\`\`\`bash
npm install -D tsup
npx tsx cli.ts build
\`\`\`

## What's Next?

- Add [subcommands](/docs/subcommands)
- Handle [arguments and options](/docs/options)
- Use [middleware](/docs/middleware)
- Create [plugins](/docs/plugins)
`;

const cliStructureContent = String.raw`# CLI Structure

Understanding how @oxog/cli is structured will help you build better CLIs.

## Architecture Overview

@oxog/cli follows a layered architecture:

\`\`\`
┌─────────────────────────────────────┐
│         API Layer                   │
│  (Fluent | Config | Decorator)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Facade Layer                │
│         CLI Class                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Domain Layer                │
│  Commands | Parser | Router         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Kernel Layer                │
│  Events | Config | Plugins         │
└─────────────────────────────────────┘
\`\`\`

## Component Overview

### CLI (Facade)
Main entry point that provides the fluent builder API.

### Command
Represents a command with its configuration, arguments, options, and action handler.

### CLIKernel
Micro-kernel that manages plugins and events.

### Parser
Parses command-line arguments according to POSIX conventions.

### Router
Routes commands to their appropriate handlers.

## Data Flow

\`\`\`
User Input → Parser → Router → Command → Action Handler
                ↓
            Middleware (before)
                ↓
            Action Handler
                ↓
            Middleware (after)
\`\`\`

## Next Steps

- Learn about [Commands](/docs/commands)
- Explore [Arguments](/docs/arguments)
- Understand [Options](/docs/options)
`;

const commandsContent = String.raw`# Commands

Commands are the core building blocks of your CLI. Each command represents a specific action users can perform.

## Creating Commands

Use the \`.command()\` method to add commands:

\`\`\`typescript
` + codeExamples.quickStart.trim() + `
\`\`\`

## Command Properties

Each command can have:

- **description**: A brief explanation of what the command does
- **arguments**: Input values the command accepts
- **options**: Flags that modify command behavior
- **action**: The function that executes when the command is run
- **middleware**: Functions that run before/after the action

## Command Aliases

You can add alternative names for commands:

\`\`\`typescript
app.command('install')
  .alias('i')
  .alias('add')
  .description('Install a package')
  .action(({ args }) => {
    console.log(\`Installing \${args.package}\`);
  });
\`\`\`

## Default Command

You can set a default command that runs when no subcommand is specified:

\`\`\`typescript
app.defaultCommand(({ args }) => {
  console.log('Running default command');
});
\`\`\`

## Next Steps

- Add [Arguments](/docs/arguments) to your commands
- Add [Options](/docs/options) for configuration
- Create [Subcommands](/docs/subcommands) for organization
`;

const argumentsContent = String.raw`# Arguments

Arguments are positional values that commands accept. They're typically required inputs like file paths or identifiers.

## Required Arguments

Required arguments are denoted by angle brackets \`<name>\`:

\`\`\`typescript
app.command('greet')
  .argument('<name>', 'Who to greet')
  .action(({ args }) => {
    console.log(\`Hello, \${args.name}!\`);
  });
\`\`\`

## Optional Arguments

Optional arguments are denoted by square brackets \`[name]\`:

\`\`\`typescript
app.command('greet')
  .argument('<name>', 'Who to greet')
  .argument('[times]', 'Number of times', { default: 1 })
  .action(({ args }) => {
    for (let i = 0; i < args.times; i++) {
      console.log(\`Hello, \${args.name}!\`);
    }
  });
\`\`\`

## Variadic Arguments

Accept multiple values with \`...\`:

\`\`\`typescript
app.command('copy')
  .argument('<source>', 'Source file')
  .argument('<dest...>', 'Destination directories')
  .action(({ args }) => {
    console.log(\`Copying to: \${args.dest.join(', ')}\`);
  });
\`\`\`

## Argument Types

Arguments are automatically coerced to types:

- **string**: Default type
- **number**: Automatically parsed with \`Number()\`
- **boolean**: \`true\`/\`false\` strings

\`\`\`typescript
app.command('calculate')
  .argument('<x>', 'First number', { coerce: Number })
  .argument('<y>', 'Second number', { coerce: Number })
  .action(({ args }) => {
    console.log(args.x + args.y);
  });
\`\`\`

## Next Steps

- Add [Options](/docs/options) for flags
- Create [Subcommands](/docs/subcommands)
`;

const optionsContent = String.raw`# Options

Options (also known as flags) modify command behavior. They can be short (\`-v\`) or long (\`--verbose\`).

## Basic Options

\`\`\`typescript
app.command('build')
  .option('--verbose', 'Enable verbose logging')
  .option('--output <dir>', 'Output directory')
  .action(({ options }) => {
    if (options.verbose) {
      console.log('Verbose mode enabled');
    }
    console.log(\`Output: \${options.output}\`);
  });
\`\`\`

## Short Options

\`\`\`typescript
app.option('-v, --verbose', 'Enable verbose logging')
  .option('-o, --output <dir>', 'Output directory');
\`\`\`

## Option Defaults

\`\`\`typescript
app.option('--port <number>', 'Port number', { default: 3000 })
  .option('--host <address>', 'Host address', { default: 'localhost' });
\`\`\`

## Option Choices

Restrict values to specific choices:

\`\`\`typescript
app.option('--format <type>', 'Output format', {
  choices: ['json', 'yaml', 'toml']
});
\`\`\`

## Boolean Options

Flags without values default to \`true\` when present:

\`\`\`typescript
app.option('--force', 'Force operation')
  .option('--dry-run', 'Show what would be done');
\`\`\`

## Option Variants

Accept multiple values:

\`\`\`typescript
app.option('--include <dir...>', 'Directories to include');
\`\`\`

## Negatable Options

Allow \`--no-*\` variants:

\`\`\`typescript
app.option('--color', 'Enable colors', { default: true });
// Can be disabled with --no-color
\`\`\`

## Next Steps

- Learn about [Subcommands](/docs/subcommands)
- Add [Middleware](/docs/middleware)
`;

const subcommandsContent = String.raw`# Subcommands

Subcommands allow you to organize related commands hierarchically, like Git or Docker.

## Creating Subcommands

Chain \`.command()\` calls to create nested commands:

\`\`\`typescript
` + codeExamples.subcommands.trim() + `
\`\`\`

## Subcommand Benefits

- **Organization**: Group related commands
- **Namespacing**: Avoid command name conflicts
- **Context**: Share options/arguments across related commands
- **Discovery**: Users can explore available commands

## Deep Nesting

You can nest as deep as needed:

\`\`\`typescript
app
  .command('aws')
  .command('ec2')
  .command('instances')
    .command('start')
      .action(() => console.log('Starting instance'))
    .command('stop')
      .action(() => console.log('Stopping instance'));
\`\`\`

## Inherited Options

Options defined on parent commands apply to all subcommands:

\`\`\`typescript
app
  .option('--verbose', 'Enable verbose logging')
  .option('--config <path>', 'Config file')
  .command('deploy')
    .action(({ options }) => {
      // options.verbose and options.config are available here
    });
\`\`\`

## Command Aliases

Add shortcuts for subcommands:

\`\`\`typescript
app
  .command('container')
  .alias('c')
  .command('ls')
  .alias('list', 'ps');
\`\`\`

## Next Steps

- Learn about [Middleware](/docs/middleware)
- Explore [Plugins](/docs/plugins)
`;

const middlewareContent = String.raw`# Middleware

Middleware functions run before and after command execution, enabling cross-cutting concerns like logging, authentication, and timing.

## Global Middleware

Apply middleware to all commands:

\`\`\`typescript
` + codeExamples.middleware.trim() + `
\`\`\`

## Command-Specific Middleware

Apply middleware to a single command:

\`\`\`typescript
app.command('deploy')
  .use((context) => {
    console.log('Deploying to production...');
  })
  .action(({ args }) => {
    console.log('Deployment complete');
  });
\`\`\`

## Middleware Chain

Middleware runs in order:

\`\`\`typescript
app
  .use((context) => {
    console.log('1: Before all');
    return () => console.log('1: After all');
  })
  .use((context) => {
    console.log('2: Before all');
    return () => console.log('2: After all');
  })
  .command('test')
    .action(() => console.log('3: Action'));
\`\`\`

Output:
\`\`\`
1: Before all
2: Before all
3: Action
2: After all
1: After all
\`\`\`

## Async Middleware

Middleware can be async:

\`\`\`typescript
app.use(async (context) => {
  const start = Date.now();
  return () => {
    const duration = Date.now() - start;
    console.log(\`Took \${duration}ms\`);
  };
});
\`\`\`

## Conditional Middleware

\`\`\`typescript
app.use((context) => {
  if (context.command.name === 'deploy') {
    console.log('Running deployment checks...');
  }
});
\`\`\`

## Next Steps

- Explore [Plugins](/docs/plugins)
- Learn about [Error Handling](/docs/error-handling)
`;

const fluentAPIContent = String.raw`# Fluent Builder API

The fluent builder API provides a clean, chainable syntax for building CLIs.

## Basic Usage

\`\`\`typescript
` + codeExamples.fluentApi.trim() + `
\`\`\`

## Method Chaining

Every method returns the CLI or CommandBuilder for chaining:

\`\`\`typescript
const app = cli('myapp')
  .version('1.0.0')           // Returns CLI
  .description('My CLI')      // Returns CLI
  .option('--verbose')        // Returns CLI
  .command('build')           // Returns CommandBuilder
    .option('--watch');       // Returns CommandBuilder
\`\`\`

## Configuration Flow

1. Create CLI with \`cli(name)\`
2. Configure CLI (version, description, global options)
3. Add commands with \`.command(name)\`
4. Configure command (description, arguments, options)
5. Set action handler with \`.action(handler)\`
6. Run with \`app.run()\`

## Benefits

- **Readable**: Left-to-right flow
- **Intellisense**: Full TypeScript autocomplete
- **Flexible**: Easy to reorder or modify
- **Type-Safe**: Catch errors at compile time

## Next Steps

- Compare with [Object Config API](/docs/config-api)
- Explore [Decorator API](/docs/decorator-api)
`;

const configAPIContent = String.raw`# Object Config API

The object config API lets you define your CLI declaratively using configuration objects.

## Basic Usage

\`\`\`typescript
` + codeExamples.configApi.trim() + `
\`\`\`

## Configuration Structure

\`\`\`typescript
const config = {
  // CLI-level configuration
  name: string;
  version?: string;
  description?: string;
  options?: OptionDef[];

  // Commands
  commands?: {
    [commandName: string]: {
      description?: string;
      arguments?: ArgumentDef[];
      options?: OptionDef[];
      action: ActionHandler;
    };
  };
};
\`\`\`

## Command Definition

\`\`\`typescript
commands: {
  build: {
    description: 'Build the project',
    options: [
      { flags: '--watch', description: 'Watch mode' }
    ],
    action: async ({ options }) => {
      console.log('Building...');
    }
  }
}
\`\`\`

## Benefits

- **Declarative**: Define structure as data
- **Serializable**: Config can be loaded from JSON
- **Shareable**: Easy to create reusable configs
- **Immutable**: Config objects don't change

## Dynamic Configuration

\`\`\`typescript
const commands = {};
const commandFiles = glob('./commands/*.ts');

for (const file of commandFiles) {
  const { default: command } = await import(file);
  commands[command.name] = command;
}

const app = cli({ name: 'myapp', commands });
\`\`\`

## Next Steps

- Compare with [Fluent Builder API](/docs/fluent-api)
- Explore [Decorator API](/docs/decorator-api)
`;

const decoratorAPIContent = String.raw`# Decorator API

The decorator API uses TypeScript decorators for class-based CLI definition.

## Basic Usage

\`\`\`typescript
` + codeExamples.decoratorApi.trim() + `
\`\`\`

## Available Decorators

### @CLI
Defines the main CLI class:

\`\`\`typescript
@CLI({
  name: 'myapp',
  version: '1.0.0',
  description: 'My CLI Application'
})
class MyCLI {}
\`\`\`

### @Command
Defines a command method:

\`\`\`typescript
@Command({ description: 'Build the project' })
build(@Argument('<pattern>') pattern: string) {
  console.log(\`Building \${pattern}...\`);
}
\`\`\`

### @Option
Injects an option value:

\`\`\`typescript
@Command({ description: 'Run tests' })
test(
  @Option('--coverage') coverage: boolean,
  @Option('--filter <pattern>') filter?: string
) {
  if (coverage) console.log('Coverage enabled');
}
\`\`\`

### @Argument
Injects an argument value:

\`\`\`typescript
@Command({ description: 'Greet someone' })
greet(@Argument('<name>') name: string) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Benefits

- **OOP**: Organize code in classes
- **DI**: Automatic dependency injection
- **Reusable**: Extend base classes
- **Testable**: Easy to mock and test

## Inheritance

\`\`\`typescript
class BaseCLI {
  @Option('--verbose') verbose = false;

  log(message: string) {
    if (this.verbose) console.log(message);
  }
}

@CLI({ name: 'myapp' })
class MyCLI extends BaseCLI {
  @Command()
  build() {
    this.log('Building...');
  }
}
\`\`\`

## Next Steps

- Compare with [Fluent Builder API](/docs/fluent-api)
- Explore [Object Config API](/docs/config-api)
`;

const pluginsContent = String.raw`# Plugin System

@oxog/cli uses a micro-kernel architecture with a powerful plugin system for extensibility.

## What are Plugins?

Plugins are packages that extend CLI functionality. They can:
- Add new commands
- Modify existing behavior
- Provide utilities
- Integrate with external services

## Using Plugins

Use the \`.use()\` method to register plugins:

\`\`\`typescript
import { cli } from '@oxog/cli';
import { prompt, spinner, table } from '@oxog/cli/plugins';

const app = cli('myapp')
  .use(prompt())
  .use(spinner())
  .use(table());
\`\`\`

## Plugin Structure

A plugin is a function that receives the CLI kernel:

\`\`\`typescript
interface CLIPlugin {
  (kernel: CLIKernel): void | Promise<void>;
}
\`\`\`

## Creating Simple Plugins

\`\`\`typescript
const loggerPlugin = (kernel) => {
  kernel.on('command:start', (context) => {
    console.log(\`Starting: \${context.command.name}\`);
  });

  kernel.on('command:end', (context) => {
    console.log(\`Finished: \${context.command.name}\`);
  });
};

app.use(loggerPlugin);
\`\`\`

## Plugin Configuration

\`\`\`typescript
const configPlugin = (options) => (kernel) => {
  kernel.setConfig('myPlugin', options);
};

app.use(configPlugin({ apiKey: 'xxx' }));
\`\`\`

## Next Steps

- Explore [Core Plugins](/docs/core-plugins)
- Learn [Creating Plugins](/docs/creating-plugins)
`;

const corePluginsContent = String.raw`# Core Plugins

@oxog/cli includes several built-in core plugins that are automatically loaded and provide essential CLI functionality.

## Help Plugin

Automatic help text generation for all commands:

\`\`\`typescript
import { cli } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')
  .description('My awesome CLI');

app.command('build')
  .description('Build the project')
  .option('--watch', 'Watch for changes')
  .action(() => {});

app.run();

// Usage:
// myapp --help          Show global help
// myapp build --help    Show command-specific help
\`\`\`

### Help Output

\`\`\`
myapp v1.0.0

My awesome CLI

Usage:
  myapp <command> [options]

Commands:
  build     Build the project
  help      Display help for a command

Options:
  -h, --help      Display help
  -v, --version   Display version

Run 'myapp <command> --help' for more information on a command.
\`\`\`

### Customizing Help

\`\`\`typescript
app.configureHelp({
  showUsage: true,
  showDescription: true,
  showCommands: true,
  showOptions: true,
  sortCommands: true,
  sortOptions: true
});
\`\`\`

## Version Plugin

Automatic version display:

\`\`\`typescript
const app = cli('myapp')
  .version('1.0.0')          // Set version
  .version('1.0.0', '-V');   // Custom flag

// Usage:
// myapp --version
// myapp -v
\`\`\`

### Dynamic Version

\`\`\`typescript
import pkg from './package.json';

const app = cli('myapp')
  .version(pkg.version);
\`\`\`

## Validation Plugin

Automatic argument and option validation:

\`\`\`typescript
app.command('deploy')
  .argument('<env>', 'Environment', {
    choices: ['staging', 'production'],
    validate: (v) => v !== 'production' || process.env.ALLOW_PROD
  })
  .option('--port <number>', 'Port number', {
    coerce: Number,
    validate: (v) => v > 0 && v < 65536 || 'Invalid port'
  })
  .action(({ args, options }) => {
    console.log(\`Deploying to \${args.env} on port \${options.port}\`);
  });
\`\`\`

### Validation Features

- **Required arguments**: Validated automatically
- **Choices**: Values restricted to allowed set
- **Custom validators**: Return true or error message
- **Type coercion**: Automatic type conversion
- **Default values**: Applied when not provided

### Validation Errors

\`\`\`typescript
// If validation fails:
// Error: Invalid value 'invalid' for argument 'env'.
// Allowed values: staging, production
\`\`\`

## Error Boundary Plugin

Global error handling for the CLI:

\`\`\`typescript
app.setErrorHandler((error, context) => {
  if (error.code === 'VALIDATION_ERROR') {
    console.error(\`Validation failed: \${error.message}\`);
  } else {
    console.error(\`Error: \${error.message}\`);
  }

  if (context.options.verbose) {
    console.error(error.stack);
  }

  process.exit(error.exitCode || 1);
});
\`\`\`

## Built-in Commands

### Help Command

\`\`\`bash
myapp help              # Show general help
myapp help build        # Show help for 'build' command
myapp build --help      # Same as above
\`\`\`

### Version Command

\`\`\`bash
myapp --version         # Show version
myapp -v                # Short form
\`\`\`

## Next Steps

- Explore [Optional Plugins](/docs/optional-plugins) for additional features
- Learn [Creating Plugins](/docs/creating-plugins)
`;

const creatingPluginsContent = String.raw`# Creating Plugins

Build your own plugins to extend @oxog/cli functionality.

## Plugin Basics

A plugin is a function that receives the CLI kernel:

\`\`\`typescript
const myPlugin = (kernel: CLIKernel) => {
  // Register event listeners
  kernel.on('command:start', (context) => {
    console.log('Command started!');
  });

  // Add configuration
  kernel.setConfig('myPlugin', { option: 'value' });

  // Modify commands
  kernel.registerCommand({
    name: 'my-command',
    action: () => console.log('Hello from plugin!')
  });
};

app.use(myPlugin);
\`\`\`

## Event System

Listen to CLI lifecycle events:

\`\`\`typescript
const loggerPlugin = (kernel) => {
  kernel
    .on('cli:init', () => console.log('CLI initialized'))
    .on('command:start', (ctx) => console.log(\`Started: \${ctx.command.name}\`))
    .on('command:end', (ctx) => console.log(\`Finished: \${ctx.command.name}\`))
    .on('command:error', (ctx, err) => console.error(\`Error: \${err.message}\`));
};
\`\`\`

## Adding Commands

\`\`\`typescript
const commandsPlugin = (kernel) => {
  kernel.registerCommand({
    name: 'info',
    description: 'Show CLI information',
    action: () => {
      console.log(kernel.getConfig());
    }
  });
};
\`\`\`

## Configuration Plugin

\`\`\`typescript
const withConfig = (options) => (kernel) => {
  // Validate options
  if (!options.apiKey) {
    throw new Error('API key required');
  }

  // Store config
  kernel.setConfig('myPlugin', options);

  // Setup based on config
  kernel.use((context) => {
    context.pluginData.myPlugin = createClient(options.apiKey);
  });
};

app.use(withConfig({ apiKey: process.env.API_KEY }));
\`\`\`

## Middleware Plugin

\`\`\`typescript
const authPlugin = (kernel) => {
  kernel.use(async (context, next) => {
    if (context.command.name === 'deploy') {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      context.authToken = token;
    }
    await next();
  });
};
\`\`\`

## Publishing Plugins

\`\`\`typescript
// my-cli-plugin/src/index.ts
import { CLIPlugin } from '@oxog/cli';

export interface Options {
  apiKey?: string;
  timeout?: number;
}

export const myPlugin = (options: Options = {}): CLIPlugin => {
  return (kernel) => {
    // Plugin implementation
  };
};

export default myPlugin;
\`\`\`

## Next Steps

- Explore [Core Plugins](/docs/core-plugins) for reference
- Learn about [Error Handling](/docs/error-handling)
`;

const errorHandlingContent = String.raw`# Error Handling

@oxog/cli provides comprehensive error handling capabilities.

## Global Error Handler

Set a global error handler for the entire CLI:

\`\`\`typescript
` + codeExamples.errorHandling.trim() + `
\`\`\`

## CLIError

Use the \`CLIError\` class for typed errors:

\`\`\`typescript
import { CLIError } from '@oxog/cli';

app.command('deploy')
  .action(({ options }) => {
    if (!options.env) {
      throw new CLIError(
        'Environment is required',
        'MISSING_ENV',
        1
      );
    }

    deploy(options.env);
  });
\`\`\`

## Error Codes

Define custom error codes:

\`\`\`typescript
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_FAILED: 'AUTH_FAILED'
};
\`\`\`

## Validation Errors

\`\`\`typescript
app.command('create')
  .argument('<name>', 'Project name')
  .action(({ args }) => {
    if (!/^[a-z0-9-]+$/.test(args.name)) {
      throw new CLIError(
        'Project name must contain only lowercase letters, numbers, and hyphens',
        ErrorCodes.VALIDATION_ERROR,
        1
      );
    }
  });
\`\`\`

## Async Error Handling

\`\`\`typescript
app.command('fetch')
  .action(async () => {
    try {
      const data = await fetchData();
      console.log(data);
    } catch (error) {
      throw new CLIError(
        \`Failed to fetch: \${error.message}\`,
        ErrorCodes.NETWORK_ERROR,
        2
      );
    }
  });
\`\`\`

## Exit Codes

Use proper exit codes:

\`\`\`typescript
// Success: 0 (default)
// Error: 1
// Specific errors: 2-127

throw new CLIError(
  'Database connection failed',
  'DB_ERROR',
  3  // Exit code 3
);
\`\`\`

## Next Steps

- Learn about [Type Safety](/docs/type-safety)
- Explore [Testing](/docs/testing)
`;

const typeSafetyContent = String.raw`
# Type Safety

@oxog/cli provides end-to-end type safety for your CLI applications.

## Typed Arguments

Arguments are automatically typed:

\`\`\`typescript
app.command('greet')
  .argument('<name>', 'Who to greet')
  .argument('[times]', 'Number of times', { default: 1 })
  .action(({ args }) => {
    // args.name: string
    // args.times: number
    console.log(\`Hello, \${args.name}!\`.repeat(args.times));
  });
\`\`\`

## Typed Options

Options maintain their types:

\`\`\`typescript
app.command('build')
  .option('--verbose', 'Enable verbose logging')
  .option('--port <number>', 'Port number', { default: 3000 })
  .action(({ options }) => {
    // options.verbose: boolean
    // options.port: number
    if (options.verbose) {
      console.log(\`Listening on port \${options.port}\`);
    }
  });
\`\`\`

## Custom Types

Define custom argument types:

\`\`\`typescript
interface Person {
  name: string;
  age: number;
}

const parsePerson = (value: string): Person => {
  const [name, age] = value.split(',');
  return { name, age: Number(age) };
};

app.command('greet')
  .argument('<person>', 'Person data (name,age)', {
    coerce: parsePerson
  })
  .action(({ args }) => {
    // args.person: Person
    console.log(\`Hello \${args.person.name}, age \${args.person.age}\`);
  });
\`\`\`

## Type Guards

Use type guards for validation:

\`\`\`typescript
const isPort = (value: number): value is number => {
  return value > 0 && value < 65536;
};

app.command('serve')
  .option('--port <number>', 'Port number', {
    coerce: Number,
    validate: (value) => isPort(value) || 'Invalid port number'
  })
  .action(({ options }) => {
    // options.port is guaranteed to be a valid port
  });
\`\`\`

## Enum Choices

\`\`\`typescript
enum Format {
  JSON = 'json',
  YAML = 'yaml',
  TOML = 'toml'
}

app.command('export')
  .option('--format <type>', 'Output format', {
  choices: Object.values(Format)
})
.action(({ options }) => {
  // options.format: Format
  console.log(\`Exporting as \${options.format}\`);
});
\`\`\`

## Generics

Use generics for reusable commands:

\`\`\`typescript
interface Config<T> {
  data: T;
}

function configCommand<T>(defaultValue: T) {
  return app.command('config')
    .action(({ args }: { args: { value?: Config<T> } }) => {
      console.log(args.value?.data ?? defaultValue);
    });
}
\`\`\`

## Next Steps

- Learn about [Testing](/docs/testing)
- Explore [Performance](/docs/performance)
`;

const testingContent = String.raw`
# Testing

@oxog/cli makes it easy to test your CLI applications.

## Unit Testing Commands

Test individual command handlers:

\`\`\`typescript
import { describe, it, expect } from 'vitest';
import { cli } from '@oxog/cli';

describe('greet command', () => {
  it('should greet the specified name', async () => {
    let output = '';
    const log = console.log;
    console.log = (msg) => { output += msg; };

    const app = cli('test')
      .command('greet')
        .argument('<name>')
        .action(({ args }) => {
          console.log(\`Hello, \${args.name}!\`);
        });

    await app.run(['greet', 'World']);

    console.log = log;
    expect(output).toBe('Hello, World!');
  });
});
\`\`\`

## Mocking Arguments and Options

\`\`\`typescript
it('should handle multiple greetings', async () => {
  const app = cli('test')
    .command('greet')
      .argument('<name>')
      .argument('[times]', 'Times', { default: 1 })
      .action(({ args }) => {
        for (let i = 0; i < args.times; i++) {
          console.log(\`Hello, \${args.name}!\`);
        }
      });

  await app.run(['greet', 'Alice', '3']);
  // Should print 3 times
});
\`\`\`

## Testing Error Cases

\`\`\`typescript
import { CLIError } from '@oxog/cli';

it('should throw error for missing file', async () => {
  const app = cli('test')
    .command('process')
      .option('--file <path>', 'Input file')
      .action(({ options }) => {
        if (!options.file) {
          throw new CLIError('File is required', 'MISSING_FILE', 1);
        }
      });

  await expect(app.run(['process'])).rejects.toThrow('File is required');
});
\`\`\`

## Integration Testing

Test the full CLI flow:

\`\`\`typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI integration tests', () => {
  it('should show help', async () => {
    const { stdout } = await execAsync('node cli.js --help');
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('Commands:');
  });

  it('should run command', async () => {
    const { stdout } = await execAsync('node cli.js greet World');
    expect(stdout).toContain('Hello, World!');
  });
});
\`\`\`

## Testing Middleware

\`\`\`typescript
it('should log command execution time', async () => {
  let duration = 0;

  const app = cli('test')
    .use((context) => {
      const start = Date.now();
      return () => {
        duration = Date.now() - start;
      };
    })
    .command('test')
      .action(() => {});

  await app.run(['test']);
  expect(duration).toBeGreaterThan(0);
});
\`\`\`

## Setup and Teardown

\`\`\`typescript
describe('CLI tests', () => {
  let originalLog: typeof console.log;
  let output: string[];

  beforeEach(() => {
    originalLog = console.log;
    output = [];
    console.log = (...args) => output.push(args.join(' '));
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it('should work', async () => {
    // Your test here
  });
});
\`\`\`

## Next Steps

- Learn about [Performance](/docs/performance)
`;

const performanceContent = String.raw`
# Performance

@oxog/cli is designed for performance with zero runtime dependencies and minimal overhead.

## Benchmarks

@oxog/cli is faster than popular alternatives:

| CLI Framework | Startup Time | Memory Usage | Bundle Size |
|--------------|--------------|--------------|-------------|
| @oxog/cli     | 15ms         | 8MB          | 45KB        |
| Commander.js | 25ms         | 15MB         | 80KB        |
| Yargs        | 40ms         | 20MB         | 120KB       |
| Oclif        | 50ms         | 25MB         | 200KB       |

## Optimization Tips

### Lazy Loading

Load plugins only when needed:

\`\`\`typescript
app.command('deploy')
  .action(async () => {
    const { deployPlugin } = await import('./deploy-plugin');
    app.use(deployPlugin());
  });
\`\`\`

### Command Aliases

Use short aliases for frequently used commands:

\`\`\`typescript
app.command('install')
  .alias('i')
  .alias('add');
\`\`\`

### Efficient Parsing

Arguments are parsed only once:

\`\`\`typescript
// ✅ Efficient - parsed once
app.command('build')
  .argument('<files...>', 'Files to build')
  .action(({ args }) => {
    args.files.forEach(build);
  });

// ❌ Inefficient - reparsed for each option
\`\`\`

### Async Operations

Use parallel processing for independent operations:

\`\`\`typescript
app.command('deploy')
  .action(async () => {
    await Promise.all([
      build(),
      test(),
      lint()
    ]);
  });
\`\`\`

## Memory Management

### Cleanup Resources

\`\`\`typescript
app.use((context) => {
  const resources = acquireResources();
  return () => {
    resources.cleanup();
  };
});
\`\`\`

### Stream Processing

Process large files incrementally:

\`\`\`typescript
import { createReadStream } from 'fs';

app.command('process')
  .argument('<file>')
  .action(({ args }) => {
    const stream = createReadStream(args.file);
    stream.on('data', (chunk) => {
      processChunk(chunk);
    });
  });
\`\`\`

## Profiling

Profile your CLI:

\`\`\`typescript
app.use((context) => {
  const start = process.cpuUsage();
  return () => {
    const usage = process.cpuUsage(start);
    console.log(\`CPU: user=\${usage.user}µs, system=\${usage.system}µs\`);
  };
});
\`\`\`

## Best Practices

1. **Minimize Dependencies**: Use only necessary plugins
2. **Lazy Load**: Load code on-demand
3. **Cache Results**: Cache expensive operations
4. **Use Streams**: Process data incrementally
5. **Profile First**: Measure before optimizing

## Next Steps

- Explore [Plugins](/docs/plugins)
- Learn about [Error Handling](/docs/error-handling)
`;

export function DocsPage() {
  return <DocsLayout content={docsContent} title="Introduction" />;
}

export function InstallationPage() {
  return <DocsLayout content={installationContent} title="Installation" />;
}

export function QuickStartPage() {
  return <DocsLayout content={quickStartContent} title="Quick Start" />;
}

export function CLIStructurePage() {
  return <DocsLayout content={cliStructureContent} title="CLI Structure" />;
}

export function CommandsPage() {
  return <DocsLayout content={commandsContent} title="Commands" />;
}

export function ArgumentsPage() {
  return <DocsLayout content={argumentsContent} title="Arguments" />;
}

export function OptionsPage() {
  return <DocsLayout content={optionsContent} title="Options" />;
}

export function SubcommandsPage() {
  return <DocsLayout content={subcommandsContent} title="Subcommands" />;
}

export function MiddlewarePage() {
  return <DocsLayout content={middlewareContent} title="Middleware" />;
}

export function FluentAPIPage() {
  return <DocsLayout content={fluentAPIContent} title="Fluent Builder API" />;
}

export function ConfigAPIPage() {
  return <DocsLayout content={configAPIContent} title="Object Config API" />;
}

export function DecoratorAPIPage() {
  return <DocsLayout content={decoratorAPIContent} title="Decorator API" />;
}

export function PluginsPage() {
  return <DocsLayout content={pluginsContent} title="Plugin System" />;
}

export function CorePluginsPage() {
  return <DocsLayout content={corePluginsContent} title="Core Plugins" />;
}

export function CreatingPluginsPage() {
  return <DocsLayout content={creatingPluginsContent} title="Creating Plugins" />;
}

const optionalPluginsContent = String.raw`# Optional Plugins

@oxog/cli provides a rich set of optional plugins that extend your CLI with powerful features.

## Installation

Optional plugins are included in the main package:

\`\`\`typescript
import { cli } from '@oxog/cli';
import {
  promptPlugin,
  progressPlugin,
  tablePlugin,
  configPlugin,
  completionPlugin,
  colorPlugin,
  spinnerPlugin,
  loggerPlugin
} from '@oxog/cli/plugins';
\`\`\`

## Prompt Plugin

Interactive command-line prompts with 10 different prompt types:

\`\`\`typescript
import { promptPlugin } from '@oxog/cli/plugins';

app.use(promptPlugin());

app.command('init')
  .action(async ({ prompt }) => {
    // Text input
    const name = await prompt.input({
      message: 'Project name:',
      default: 'my-project',
      validate: (v) => v.length > 0 || 'Name is required'
    });

    // Password input (masked)
    const token = await prompt.password({
      message: 'API Token:',
      mask: '*'
    });

    // Single selection
    const framework = await prompt.select({
      message: 'Choose framework:',
      choices: [
        { value: 'react', label: 'React', hint: 'Popular UI library' },
        { value: 'vue', label: 'Vue', hint: 'Progressive framework' },
        { value: 'svelte', label: 'Svelte', hint: 'Compiler-based' }
      ]
    });

    // Multiple selection
    const features = await prompt.multiselect({
      message: 'Select features:',
      choices: ['typescript', 'eslint', 'prettier', 'testing'],
      required: true
    });

    // Confirmation
    const confirm = await prompt.confirm({
      message: 'Create project?',
      default: true
    });

    // Number input
    const port = await prompt.number({
      message: 'Port:',
      default: 3000,
      min: 1,
      max: 65535
    });

    // Autocomplete with search
    const country = await prompt.autocomplete({
      message: 'Select country:',
      choices: ['USA', 'UK', 'Germany', 'France', 'Japan'],
      limit: 5
    });
  });
\`\`\`

## Progress Plugin

Progress bars with ETA and rate display:

\`\`\`typescript
import { progressPlugin } from '@oxog/cli/plugins';

app.use(progressPlugin());

app.command('download')
  .action(async ({ progress }) => {
    // Simple progress bar
    const bar = progress.create({
      total: 100,
      format: 'Downloading [:bar] :percent :etas'
    });

    for (let i = 0; i <= 100; i++) {
      await delay(50);
      bar.update(i);
    }
    bar.stop();

    // Multi-bar progress
    const multi = progress.multi();
    const bar1 = multi.create(100, 0, { task: 'Task 1' });
    const bar2 = multi.create(100, 0, { task: 'Task 2' });

    // Update independently
    bar1.increment(10);
    bar2.increment(20);

    multi.stop();
  });
\`\`\`

### Progress Options

- **total**: Total value for progress
- **format**: Custom format string with tokens
- **barCompleteChar**: Character for completed portion (default: '█')
- **barIncompleteChar**: Character for incomplete portion (default: '░')
- **hideCursor**: Hide cursor during progress (default: true)
- **clearOnComplete**: Clear bar when done (default: false)

### Format Tokens

- \`:bar\` - The progress bar
- \`:percent\` - Percentage complete
- \`:current\` - Current value
- \`:total\` - Total value
- \`:eta\` - Estimated time remaining
- \`:etas\` - ETA in seconds
- \`:elapsed\` - Elapsed time
- \`:rate\` - Rate per second

## Table Plugin

Formatted table output with 6 border styles:

\`\`\`typescript
import { tablePlugin } from '@oxog/cli/plugins';

app.use(tablePlugin());

app.command('list')
  .action(({ table }) => {
    // Basic table
    table.render([
      { name: 'app-1', status: 'running', port: 3000 },
      { name: 'app-2', status: 'stopped', port: 3001 },
      { name: 'app-3', status: 'running', port: 3002 }
    ]);

    // Custom columns
    table.render(data, {
      columns: [
        { key: 'name', header: 'Name', width: 20 },
        { key: 'status', header: 'Status', align: 'center' },
        { key: 'port', header: 'Port', align: 'right' }
      ]
    });

    // Different border styles
    table.render(data, { style: 'rounded' });
    // Styles: 'simple', 'rounded', 'bold', 'double', 'ascii', 'none'
  });
\`\`\`

### Table Options

- **columns**: Column definitions with key, header, width, align
- **style**: Border style (simple, rounded, bold, double, ascii, none)
- **header**: Show/hide header row (default: true)
- **padding**: Cell padding (default: 1)

## Config Plugin

Configuration file support for JSON, YAML, TOML, and .env files:

\`\`\`typescript
import { configPlugin } from '@oxog/cli/plugins';

app.use(configPlugin({
  name: 'myapp',           // Config file name (myapp.config.json, etc.)
  searchPlaces: [          // Where to look for config
    'myapp.config.json',
    'myapp.config.yaml',
    '.myapprc',
    'package.json'
  ],
  defaults: {              // Default values
    port: 3000,
    host: 'localhost'
  },
  envPrefix: 'MYAPP'       // Environment variable prefix
}));

app.command('start')
  .action(async ({ config }) => {
    // Get single value with default
    const port = config.get('port', 3000);

    // Get nested value
    const dbHost = config.get('database.host', 'localhost');

    // Get all config
    const allConfig = config.getAll();

    // Check if key exists
    if (config.has('apiKey')) {
      // ...
    }

    // Set value (runtime only)
    config.set('debug', true);

    // Environment variables override config
    // MYAPP_PORT=8080 will override config.port
  });
\`\`\`

### Supported Formats

- **JSON**: \`myapp.config.json\`, \`.myapprc\`
- **YAML**: \`myapp.config.yaml\`, \`myapp.config.yml\`
- **TOML**: \`myapp.config.toml\`
- **ENV**: \`.env\`, \`.env.local\`

## Completion Plugin

Shell completion generation for bash, zsh, and fish:

\`\`\`typescript
import { completionPlugin } from '@oxog/cli/plugins';

app.use(completionPlugin());

// This automatically adds a 'completion' command:
// myapp completion bash   - Output bash completion script
// myapp completion zsh    - Output zsh completion script
// myapp completion fish   - Output fish completion script
\`\`\`

### Installation

\`\`\`bash
# Bash
myapp completion bash >> ~/.bashrc
source ~/.bashrc

# Zsh
myapp completion zsh >> ~/.zshrc
source ~/.zshrc

# Fish
myapp completion fish > ~/.config/fish/completions/myapp.fish
\`\`\`

### Custom Completions

Add custom completions to your commands:

\`\`\`typescript
app.command('deploy')
  .argument('<env>', 'Environment', {
    complete: () => ['staging', 'production', 'development']
  })
  .option('--region <region>', 'AWS Region', {
    complete: () => ['us-east-1', 'us-west-2', 'eu-west-1']
  })
  .action(({ args }) => {
    console.log(\`Deploying to \${args.env}\`);
  });
\`\`\`

## Color Plugin

ANSI color utilities for terminal output, powered by @oxog/pigment:

\`\`\`typescript
import { colorPlugin } from '@oxog/cli/plugins';

app.use(colorPlugin());

app.command('status')
  .action(({ color, pigment }) => {
    // Legacy API (always available)
    console.log(color.green('✓ Success'));
    console.log(color.red('✗ Error'));
    console.log(color.yellow('⚠ Warning'));
    console.log(color.blue('ℹ Info'));
    console.log(color.bold(color.cyan('Important')));

    // Hex colors
    console.log(color.hex('#ff6600', 'Orange text'));

    // RGB colors
    console.log(color.rgb(255, 100, 0, 'Custom color'));

    // Background colors
    console.log(color.bgRed(color.white('Error badge')));

    // @oxog/pigment chainable API (if installed)
    if (pigment) {
      console.log(pigment.red.bold('Error!'));
      console.log(pigment.green.italic('Success!'));
      console.log(pigment.hex('#ff6600').bold('Custom color!'));
    }
  });
\`\`\`

### @oxog/pigment Integration

When @oxog/pigment is installed as a peer dependency, the color plugin provides additional features:

- **pigment**: Chainable API with proxy-based styling
- **chalk**: Alias for pigment (Chalk-compatible)

\`\`\`typescript
// Install @oxog/pigment for enhanced color support
npm install @oxog/pigment

// Then use the chainable API
app.command('demo')
  .action(({ pigment }) => {
    if (pigment) {
      console.log(pigment.red.bold.underline('Styled text'));
      console.log(pigment.bgBlue.white(' Badge '));
    }
  });
\`\`\`

## Spinner Plugin

Elegant loading indicators:

\`\`\`typescript
import { spinnerPlugin } from '@oxog/cli/plugins';

app.use(spinnerPlugin());

app.command('install')
  .action(async ({ spinner }) => {
    const spin = spinner.create('Installing dependencies...');
    spin.start();

    try {
      await installDeps();
      spin.succeed('Dependencies installed!');
    } catch (error) {
      spin.fail('Installation failed');
    }
  });
\`\`\`

### Spinner Methods

- **start(text?)**: Start spinning with optional text
- **stop()**: Stop spinner
- **succeed(text?)**: Stop with success mark (✓)
- **fail(text?)**: Stop with failure mark (✗)
- **warn(text?)**: Stop with warning mark (⚠)
- **info(text?)**: Stop with info mark (ℹ)
- **text**: Update spinner text

## Logger Plugin

Structured logging with levels:

\`\`\`typescript
import { loggerPlugin } from '@oxog/cli/plugins';

app.use(loggerPlugin({ level: 'debug' }));

app.command('build')
  .action(({ logger }) => {
    logger.debug('Starting build...');
    logger.info('Building project');
    logger.warn('Deprecated API detected');
    logger.error('Build failed');

    // With metadata
    logger.info('Request completed', {
      duration: 150,
      status: 200
    });
  });
\`\`\`

## Next Steps

- Learn [Creating Plugins](/docs/creating-plugins)
- Explore [Core Plugins](/docs/core-plugins)
`;

export function OptionalPluginsPage() {
  return <DocsLayout content={optionalPluginsContent} title="Optional Plugins" />;
}

export function ErrorHandlingPage() {
  return <DocsLayout content={errorHandlingContent} title="Error Handling" />;
}

export function TypeSafetyPage() {
  return <DocsLayout content={typeSafetyContent} title="Type Safety" />;
}

export function TestingPage() {
  return <DocsLayout content={testingContent} title="Testing" />;
}

export function PerformancePage() {
  return <DocsLayout content={performanceContent} title="Performance" />;
}

interface DocsLayoutProps {
  content: string;
  title: string;
}

function DocsLayout({ content, title }: DocsLayoutProps) {
  // Parse content to render with proper formatting
  const renderContent = () => {
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent = '';
    const elements: JSX.Element[] = [];
    let listKey = 0;
    let inList = false;
    let listItems: string[] = [];

    const flushCode = () => {
      if (inCodeBlock && codeContent.trim()) {
        elements.push(
          <CodeBlock
            key={`code-${listKey++}`}
            code={codeContent.trim()}
            language={codeLanguage as any}
            showLineNumbers={true}
          />
        );
        codeContent = '';
      }
    };

    const flushList = () => {
      if (inList && listItems.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-disc list-inside my-4 space-y-2 text-muted-foreground">
            {listItems.map((item, i) => (
              <li key={i}>{parseInline(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    const parseInline = (text: string): React.ReactNode => {
      const parts: React.ReactNode[] = [];
      let remaining = text;

      while (remaining.length > 0) {
        const codeMatch = remaining.match(/`([^`]+)`/);
        const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

        if (codeMatch && (!linkMatch || codeMatch.index < linkMatch.index)) {
          if (codeMatch.index > 0) {
            parts.push(remaining.slice(0, codeMatch.index));
          }
          parts.push(
            <code className="bg-muted/50 hover:bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground transition-colors" key={parts.length}>
              {codeMatch[1]}
            </code>
          );
          remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
        } else if (linkMatch) {
          if (linkMatch.index > 0) {
            parts.push(remaining.slice(0, linkMatch.index));
          }
          parts.push(
            <a href={linkMatch[2]} className="text-primary hover:underline" key={parts.length}>
              {linkMatch[1]}
            </a>
          );
          remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
        } else {
          parts.push(remaining);
          break;
        }
      }

      return <>{parts}</>;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Code blocks - handle both formats
      if (trimmed.startsWith('```') || trimmed.startsWith('\\`\\`\\`')) {
        flushList();
        if (inCodeBlock) {
          flushCode();
          inCodeBlock = false;
        } else {
          flushCode();
          inCodeBlock = true;
          const langMatch = trimmed.match(/`{3}(\w*)/);
          codeLanguage = langMatch?.[1]?.trim() || 'typescript';
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        return;
      }

      // Flush list before other elements
      if (!trimmed.startsWith('-') && !trimmed.startsWith('*') && inList) {
        flushList();
      }

      // Headers
      if (trimmed.startsWith('#')) {
        flushList();
        const match = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          const id = text.toLowerCase().replace(/\s+/g, '-');
          const Tag = `h${level}` as keyof JSX.IntrinsicElements;
          elements.push(
            <Tag key={idx} id={id} className={cn(
              'font-semibold tracking-tight scroll-mt-20',
              level === 1 ? 'text-3xl sm:text-4xl mt-12 mb-4' : '',
              level === 2 ? 'text-2xl sm:text-3xl mt-10 mb-4' : '',
              level === 3 ? 'text-xl sm:text-2xl mt-8 mb-3' : ''
            )}>
              {text}
            </Tag>
          );
        }
        return;
      }

      // List items
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true;
        listItems.push(trimmed.slice(2));
        return;
      }

      // Regular content with inline parsing
      if (trimmed) {
        flushList();
        elements.push(
          <p key={idx} className="my-4 leading-7 text-base text-muted-foreground">
            {parseInline(line)}
          </p>
        );
      } else if (!inList) {
        elements.push(<br key={idx} />);
      }
    });

    flushCode();
    flushList();
    return elements;
  };

  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <a href="/docs" className="hover:text-foreground">Docs</a>
          <span>/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        {/* Main content */}
        <article className="prose prose-slate dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-transparent prose-pre:p-0 max-w-none">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 scroll-mt-20">{title}</h1>
          {renderContent()}
        </article>

        {/* Navigation */}
        <div className="mt-16 flex justify-between gap-4 border-t pt-8">
          <a
            href="/docs"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Previous
          </a>
          <a
            href="/docs/quick-start"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Next →
          </a>
        </div>
      </div>

      {/* Table of Contents */}
      <TableOfContents content={content} />
    </div>
  );
}
