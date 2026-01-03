export const siteConfig = {
  name: '@oxog/cli',
  description: 'Zero-Dependency CLI Framework with Type Safety',
  url: 'https://oxog.dev',
  links: {
    github: 'https://github.com/ersinkoc/cli',
    npm: 'https://www.npmjs.com/package/@oxog/cli',
  },
};

export const docsNavigation = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs', id: 'introduction' },
      { title: 'Installation', href: '/docs/installation', id: 'installation' },
      { title: 'Quick Start', href: '/docs/quick-start', id: 'quick-start' },
      { title: 'CLI Structure', href: '/docs/cli-structure', id: 'cli-structure' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'Commands', href: '/docs/commands', id: 'commands' },
      { title: 'Arguments', href: '/docs/arguments', id: 'arguments' },
      { title: 'Options', href: '/docs/options', id: 'options' },
      { title: 'Subcommands', href: '/docs/subcommands', id: 'subcommands' },
      { title: 'Middleware', href: '/docs/middleware', id: 'middleware' },
    ],
  },
  {
    title: 'API Styles',
    items: [
      { title: 'Fluent Builder', href: '/docs/fluent-api', id: 'fluent-api' },
      { title: 'Object Config', href: '/docs/config-api', id: 'config-api' },
      { title: 'Decorators', href: '/docs/decorator-api', id: 'decorator-api' },
    ],
  },
  {
    title: 'Plugins',
    items: [
      { title: 'Plugin System', href: '/docs/plugins', id: 'plugins' },
      { title: 'Core Plugins', href: '/docs/core-plugins', id: 'core-plugins' },
      { title: 'Creating Plugins', href: '/docs/creating-plugins', id: 'creating-plugins' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { title: 'Error Handling', href: '/docs/error-handling', id: 'error-handling' },
      { title: 'Type Safety', href: '/docs/type-safety', id: 'type-safety' },
      { title: 'Testing', href: '/docs/testing', id: 'testing' },
      { title: 'Performance', href: '/docs/performance', id: 'performance' },
    ],
  },
];

export const apiNavigation = [
  {
    title: 'Classes',
    items: [
      { title: 'CLI', href: '/api/cli', id: 'cli' },
      { title: 'Command', href: '/api/command', id: 'command' },
      { title: 'CommandBuilder', href: '/api/command-builder', id: 'command-builder' },
      { title: 'CLIKernel', href: '/api/kernel', id: 'kernel' },
    ],
  },
  {
    title: 'Interfaces',
    items: [
      { title: 'CLIOptions', href: '/api/cli-options', id: 'cli-options' },
      { title: 'CommandDef', href: '/api/command-def', id: 'command-def' },
      { title: 'ArgumentDef', href: '/api/argument-def', id: 'argument-def' },
      { title: 'OptionDef', href: '/api/option-def', id: 'option-def' },
      { title: 'CLIPlugin', href: '/api/plugin', id: 'plugin' },
      { title: 'ActionContext', href: '/api/action-context', id: 'action-context' },
    ],
  },
  {
    title: 'Functions',
    items: [
      { title: 'cli()', href: '/api/cli-function', id: 'cli-function' },
      { title: 'Command()', href: '/api/command-decorator', id: 'command-decorator' },
      { title: 'Option()', href: '/api/option-decorator', id: 'option-decorator' },
      { title: 'Argument()', href: '/api/argument-decorator', id: 'argument-decorator' },
    ],
  },
  {
    title: 'Types',
    items: [
      { title: 'ParsedArguments', href: '/api/parsed-arguments', id: 'parsed-arguments' },
      { title: 'ParsedOptions', href: '/api/parsed-options', id: 'parsed-options' },
      { title: 'Coercer', href: '/api/coercer', id: 'coercer' },
      { title: 'Validator', href: '/api/validator', id: 'validator' },
    ],
  },
];

export const examplesNavigation = [
  {
    title: 'Basic Examples',
    items: [
      { title: 'Hello World', href: '/examples/hello-world', id: 'hello-world' },
      { title: 'Greeting Command', href: '/examples/greeting', id: 'greeting' },
      { title: 'File Operations', href: '/examples/file-ops', id: 'file-ops' },
      { title: 'Data Processing', href: '/examples/data-processing', id: 'data-processing' },
    ],
  },
  {
    title: 'Intermediate',
    items: [
      { title: 'Interactive CLI', href: '/examples/interactive', id: 'interactive' },
      { title: 'Progress Bars', href: '/examples/progress', id: 'progress' },
      { title: 'Tables & Output', href: '/examples/tables', id: 'tables' },
      { title: 'Config Files', href: '/examples/config', id: 'config' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { title: 'Plugin Development', href: '/examples/plugin-dev', id: 'plugin-dev' },
      { title: 'Custom Middleware', href: '/examples/middleware', id: 'middleware' },
      { title: 'Async Commands', href: '/examples/async', id: 'async' },
      { title: 'Error Recovery', href: '/examples/error-recovery', id: 'error-recovery' },
    ],
  },
  {
    title: 'Real-world Apps',
    items: [
      { title: 'Build Tool', href: '/examples/build-tool', id: 'build-tool' },
      { title: 'Deployment CLI', href: '/examples/deployment', id: 'deployment' },
      { title: 'Database Tool', href: '/examples/database', id: 'database' },
    ],
  },
];

export const codeExamples = {
  quickStart: String.raw`import { cli } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')
  .description('My awesome CLI application')
  .command('greet')
    .description('Greet someone')
    .argument('<name>', 'Name to greet')
    .option('--loud', 'Greet loudly')
    .action(({ args, options }) => {
      const message = \`Hello, \${args.name}!\`;
      console.log(options.loud ? message.toUpperCase() : message);
    });

app.run();`,

  fluentApi: String.raw`import { cli } from '@oxog/cli';

// Fluent Builder API - chain methods
const app = cli('myapp')
  .version('1.0.0')
  .description('My CLI Application')

  // Add global option
  .option('--verbose', 'Enable verbose logging')
  .option('--config <path>', 'Config file path')

  // Add commands
  .command('build')
    .description('Build the project')
    .option('--watch', 'Watch for changes')
    .option('--output <dir>', 'Output directory', { default: 'dist' })
    .action(async ({ options }) => {
      if (options.watch) {
        console.log('Building in watch mode...');
      } else {
        console.log(\`Building to \${options.output}...\`);
      }
    })

  .command('serve')
    .description('Start development server')
    .argument('[port]', 'Port number', { default: 3000 })
    .action(({ args }) => {
      console.log(\`Server running on port \${args.port}\`);
    });

app.run();`,

  decoratorApi: String.raw`import { CLI, Command, Option, Argument } from '@oxog/cli';

@CLI({
  name: 'myapp',
  version: '1.0.0',
  description: 'My CLI Application'
})
class MyCLI {
  @Command({ description: 'Build the project' })
  build(
    @Argument('<pattern>', 'File pattern') pattern: string,
    @Option('--watch', 'Watch mode') watch: boolean
  ) {
    console.log(\`Building \${pattern}...\`);
    if (watch) {
      console.log('Watch mode enabled');
    }
  }

  @Command({ description: 'Run tests' })
  test(
    @Option('--coverage', 'Generate coverage') coverage: boolean,
    @Option('--filter <pattern>', 'Filter tests') filter?: string
  ) {
    console.log('Running tests...');
    if (coverage) console.log('Coverage enabled');
    if (filter) console.log(\`Filter: \${filter}\`);
  }

  run() {
    // Auto-runs by decorator
  }
}

new MyCLI();`,

  configApi: String.raw`import { cli } from '@oxog/cli';

// Object Config API
const app = cli({
  name: 'myapp',
  version: '1.0.0',
  description: 'My CLI Application',
  options: [
    { flags: '--verbose', description: 'Enable verbose logging' },
    { flags: '--config <path>', description: 'Config file path' },
  ],
  commands: {
    build: {
      description: 'Build the project',
      options: [
        { flags: '--watch', description: 'Watch for changes' },
        { flags: '--output <dir>', description: 'Output directory', default: 'dist' },
      ],
      action: async ({ options }) => {
        console.log(\`Building to \${options.output}...\`);
      },
    },
    deploy: {
      description: 'Deploy to production',
      arguments: [
        { name: '<environment>', description: 'Deployment environment' },
      ],
      options: [
        { flags: '--force', description: 'Force deployment' },
      ],
      action: async ({ args, options }) => {
        console.log(\`Deploying to \${args.environment}...\`);
      },
    },
  },
});

app.run();`,

  subcommands: String.raw`import { cli } from '@oxog/cli';

const app = cli('docker')
  .version('1.0.0')
  .description('Container management CLI')

  // Container subcommands
  .command('container')
    .description('Manage containers')
    .command('ls')
      .description('List containers')
      .option('--all', 'Show all containers')
      .action(({ options }) => {
        console.log(options.all ? 'Listing all containers...' : 'Listing running containers...');
      })

    .command('stop')
      .description('Stop a container')
      .argument('<id>', 'Container ID')
      .action(({ args }) => {
        console.log(\`Stopping container \${args.id}...\`);
      })

  // Image subcommands
  .command('image')
    .description('Manage images')
    .command('build')
      .description('Build an image')
      .argument('<path>', 'Dockerfile path')
      .option('--tag <name>', 'Image tag')
      .action(({ args, options }) => {
        console.log(\`Building image from \${args.path}...\`);
        if (options.tag) console.log(\`Tag: \${options.tag}\`);
      })

    .command('push')
      .description('Push image to registry')
      .argument('<name>', 'Image name')
      .action(({ args }) => {
        console.log(\`Pushing \${args.name}...\`);
      });

app.run();`,

  middleware: String.raw`import { cli } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')

// Global middleware - runs before all commands
.use((context) => {
  const start = Date.now();
  context.startTime = start;

  console.log(\`[INFO] Starting command: \${context.command.name}\`);

  // Continue to next middleware/handler
  return () => {
    const duration = Date.now() - start;
    console.log(\`[INFO] Command completed in \${duration}ms\`);
  };
})

// Command-specific middleware
.command('deploy')
  .description('Deploy application')
  .use((context) => {
    // Check if user is authenticated
    if (!context.options.token) {
      console.error('Error: Authentication required');
      process.exit(1);
    }
  })
  .option('--token <key>', 'Auth token')
  .action(({ args }) => {
    console.log('Deploying...');
  });

app.run();`,

  plugins: String.raw`import { cli, prompt, spinner, table } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')

// Use built-in plugins
.use(prompt())
.use(spinner())
.use(table())

.command('init')
  .description('Initialize project')
  .action(async () => {
    // Prompt plugin provides interactive input
    const projectName = await prompt.input({
      message: 'Project name:',
      default: 'my-project',
    });

    const framework = await prompt.select({
      message: 'Choose framework:',
      choices: [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' },
      ],
    });

    // Spinner plugin provides loading indicators
    const spin = spinner();
    spin.start('Creating project...');

    await createProject(projectName, framework);

    spin.succeed(\`Project \${projectName} created!\`);
  })

.command('list')
  .description('List resources')
  .action(() => {
    // Table plugin provides formatted output
    table([
      { name: 'app-1', status: 'running', port: 3000 },
      { name: 'app-2', status: 'stopped', port: 3001 },
      { name: 'app-3', status: 'running', port: 3002 },
    ], {
      columns: ['name', 'status', 'port'],
    });
  });

app.run();`,

  errorHandling: String.raw`import { cli, CLIError } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')

// Global error handler
.setErrorHandler((error, context) => {
  console.error('\n' + '='.repeat(50));
  console.error(\`Error: \${error.message}\`);

  if (error.code === 'VALIDATION_ERROR') {
    console.error('\nValidation failed:');
    console.error(\`  - \${error.details}\`);
  }

  if (context.options.verbose) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }

  console.error('='.repeat(50) + '\n');
  process.exit(error.exitCode || 1);
})

.command('process')
  .option('--file <path>', 'Input file')
  .action(({ options }) => {
    if (!options.file) {
      throw new CLIError(
        'File path is required',
        'MISSING_FILE',
        1
      );
    }

    if (!fs.existsSync(options.file)) {
      throw new CLIError(
        \`File not found: \${options.file}\`,
        'FILE_NOT_FOUND',
        2
      );
    }

    processFile(options.file);
  });

app.run();`,
};
