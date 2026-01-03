import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, Check, Play, ArrowLeft } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { codeExamples } from '@/lib/constants';

const examplesData: Record<string, {
  title: string;
  description: string;
  category: string;
  code: string;
  explanation?: string;
}> = {
  'hello-world': {
    title: 'Hello World',
    description: 'The simplest CLI application - greet the world!',
    category: 'Basic',
    code: `import { cli } from '@oxog/cli';

const app = cli('hello')
  .version('1.0.0')
  .command('world')
    .description('Say hello to the world')
    .action(() => {
      console.log('Hello, World!');
    });

app.run();`,
    explanation: 'This is the most basic CLI you can create. It defines a single command `world` that prints "Hello, World!" when executed.',
  },
  greeting: {
    title: 'Greeting Command',
    description: 'A personalized greeting with name and loud options.',
    category: 'Basic',
    code: codeExamples.quickStart,
    explanation: 'This example shows how to add arguments and options to your commands. The `<name>` argument is required, while `--loud` is an optional flag.',
  },
  'file-ops': {
    title: 'File Operations',
    description: 'Process files with various options.',
    category: 'Basic',
    code: `import { cli } from '@oxog/cli';
import fs from 'fs';

const app = cli('fileops')
  .version('1.0.0')
  .command('read')
    .description('Read and display a file')
    .argument('<file>', 'File path to read')
    .option('--lines <n>', 'Number of lines to display', { default: 10 })
    .action(({ args, options }) => {
      const content = fs.readFileSync(args.file, 'utf-8');
      const lines = content.split('\\n').slice(0, options.lines);
      console.log(lines.join('\\n'));
    })

  .command('write')
    .description('Write content to a file')
    .argument('<file>', 'File path to write')
    .argument('[content]', 'Content to write (reads from stdin if not provided)')
    .option('--append', 'Append to file instead of overwriting')
    .action(({ args, options }) => {
      const content = args.content || process.stdin;
      const flag = options.append ? 'a' : 'w';
      fs.writeFileSync(args.file, content, { flag });
      console.log(\`Wrote to \${args.file}\`);
    });

app.run();`,
    explanation: 'A practical example showing file reading and writing operations with command-line options.',
  },
  'data-processing': {
    title: 'Data Processing',
    description: 'Process and transform data files.',
    category: 'Basic',
    code: `import { cli } from '@oxog/cli';

const app = cli('process')
  .command('csv')
    .description('Process CSV files')
    .argument('<input>', 'Input CSV file')
    .option('--format <type>', 'Output format', { choices: ['json', 'yaml', 'toml'] })
    .option('--output <file>', 'Output file (prints to stdout if not specified)')
    .action(({ args, options }) => {
      const data = parseCSV(args.input);
      const output = formatData(data, options.format);

      if (options.output) {
        fs.writeFileSync(options.output, output);
      } else {
        console.log(output);
      }
    });

app.run();`,
  },
  'fluent-api': {
    title: 'Fluent Builder API',
    description: 'Use the fluent builder API for a clean, chainable syntax.',
    category: 'Basic',
    code: codeExamples.fluentApi,
    explanation: 'The fluent builder API provides a clean, chainable syntax for building CLIs.',
  },
  'decorator-api': {
    title: 'Decorator API',
    description: 'Use TypeScript decorators for class-based CLIs.',
    category: 'Intermediate',
    code: codeExamples.decoratorApi,
    explanation: 'Decorators provide an elegant way to define CLIs using TypeScript classes.',
  },
  subcommands: {
    title: 'Subcommands',
    description: 'Organize commands with nested subcommands.',
    category: 'Intermediate',
    code: codeExamples.subcommands,
    explanation: 'Subcommands allow you to organize related commands hierarchically, similar to git or docker.',
  },
  interactive: {
    title: 'Interactive CLI',
    description: 'Create interactive command-line interfaces.',
    category: 'Intermediate',
    code: `import { cli, prompt } from '@oxog/cli';

const app = cli('init')
  .version('1.0.0')
  .description('Initialize a new project')
  .use(prompt())

  .command('create')
    .action(async () => {
      // Get project name
      const name = await prompt.input({
        message: 'Project name:',
        default: 'my-project',
        validate: (value) => /^[a-z0-9-]+$/.test(value) || 'Must be lowercase letters, numbers, and hyphens only',
      });

      // Choose framework
      const framework = await prompt.select({
        message: 'Choose framework:',
        choices: [
          { value: 'react', label: 'React', description: 'A JavaScript library for building user interfaces' },
          { value: 'vue', label: 'Vue', description: 'The Progressive JavaScript Framework' },
          { value: 'svelte', label: 'Svelte', description: 'Cybernetically enhanced web apps' },
        ],
      });

      // Select features
      const features = await prompt.multiselect({
        message: 'Select features:',
        choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest', 'Cypress'],
        required: false,
      });

      // Confirm
      const confirmed = await prompt.confirm({
        message: 'Create project?',
        default: true,
      });

      if (confirmed) {
        console.log(\`Creating \${name} with \${framework}...\`);
        console.log('Features:', features.join(', '));
      }
    });

app.run();`,
    explanation: 'Uses the prompt plugin to create an interactive project initialization experience.',
  },
  progress: {
    title: 'Progress Bars',
    description: 'Show progress for long-running operations.',
    category: 'Intermediate',
    code: `import { cli, spinner, progress } from '@oxog/cli';

const app = cli('download')
  .use(spinner())
  .use(progress())

  .argument('<url>', 'URL to download')
  .option('--output <file>', 'Output file path')
  .action(async ({ args, options }) => {
    const spin = spinner();
    spin.start('Starting download...');

    // Get file info
    const info = await getFileInfo(args.url);
    const bar = progress({ total: info.size });

    // Download with progress
    await downloadFile(args.url, {
      onProgress: (bytes) => bar.update(bytes),
    });

    spin.succeed('Download complete!');
  });

app.run();`,
  },
  tables: {
    title: 'Tables & Output',
    description: 'Format output as tables.',
    category: 'Intermediate',
    code: `import { cli, table } from '@oxog/cli';

const app = cli('status')
  .use(table())

  .command('services')
    .description('Show all services')
    .option('--all', 'Show all services including stopped')
    .action(({ options }) => {
      const services = getServices({ all: options.all });

      table(services, {
        columns: ['name', 'status', 'port', 'memory'],
        format: {
          status: (value) => {
            const icon = value === 'running' ? '✓' : '✗';
            const color = value === 'running' ? 'green' : 'red';
            return color(color, \`\${icon} \${value}\`);
          },
          memory: (value) => \`\${(value / 1024 / 1024).toFixed(1)}MB\`,
        },
      });
    });

app.run();`,
  },
  config: {
    title: 'Config Files',
    description: 'Load and use configuration files.',
    category: 'Intermediate',
    code: `import { cli } from '@oxog/cli';
import fs from 'fs';

const app = cli('myapp')
  .version('1.0.0')

  // Global config option
  .option('--config <path>', 'Path to config file', { default: './config.json' })

  .use((context) => {
    // Load config from file
    const configPath = context.options.config || './config.json';
    try {
      context.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {
      context.config = {};
    }
  })

  .command('build')
    .description('Build the project')
    .action(({ options, config }) => {
      const buildConfig = config.build || {};
      console.log('Building with config:', buildConfig);
    });

app.run();`,
  },
  'plugin-dev': {
    title: 'Plugin Development',
    description: 'Create custom plugins.',
    category: 'Advanced',
    code: `import { cli } from '@oxog/cli';

// Custom plugin that logs command duration
const timingPlugin = (options = {}) => (kernel) => {
  kernel.on('command:start', (context) => {
    context.startTime = Date.now();
  });

  kernel.on('command:end', (context) => {
    const duration = Date.now() - context.startTime;
    const label = options.label || 'Command';
    console.log(\`\${label} completed in \${duration}ms\`);
  });
};

// Usage
const app = cli('myapp')
  .use(timingPlugin({ label: 'Build' }))
  .command('build')
    .action(() => {
      // Build logic here
    });

app.run();`,
  },
  middleware: {
    title: 'Custom Middleware',
    description: 'Add logging and timing to all commands.',
    category: 'Advanced',
    code: codeExamples.middleware,
  },
  async: {
    title: 'Async Commands',
    description: 'Handle asynchronous operations properly.',
    category: 'Advanced',
    code: `import { cli, spinner } from '@oxog/cli';

const app = cli('deploy')
  .use(spinner())

  .command('deploy')
    .description('Deploy to production')
    .argument('<environment>', 'Deployment environment')
    .option('--dry-run', 'Show what would be deployed')
    .action(async ({ args, options }) => {
      const spin = spinner();

      try {
        spin.start('Validating configuration...');
        await validateConfig(args.environment);
        spin.succeed('Configuration valid');

        spin.start('Running tests...');
        await runTests();
        spin.succeed('Tests passed');

        spin.start('Building application...');
        await buildApp();
        spin.succeed('Build complete');

        if (options.dryRun) {
          console.log('\\n[Dry run] Would deploy:', {
            environment: args.environment,
            build: getBuildInfo(),
          });
        } else {
          spin.start('Deploying...');
          await deploy(args.environment);
          spin.succeed('Deployment complete!');
        }
      } catch (error) {
        spin.fail(\`Deployment failed: \${error.message}\`);
        throw error;
      }
    });

app.run();`,
  },
  'error-recovery': {
    title: 'Error Recovery',
    description: 'Handle errors gracefully and recover.',
    category: 'Advanced',
    code: `import { cli, CLIError } from '@oxog/cli';

const app = cli('migrate')
  .version('1.0.0')

  // Global error handler
  .setErrorHandler((error, context) => {
    console.error('\\n❌ Migration failed!');
    console.error(\`Error: \${error.message}\`);

    // Suggest recovery actions
    if (error.code === 'DB_CONNECTION_ERROR') {
      console.error('\\n💡 Suggestions:');
      console.error('  - Check if database server is running');
      console.error('  - Verify connection string');
      console.error('  - Try: npm run db:check');
    }

    if (context.options.backup) {
      console.error('\\n🔄 Backup available. Restore with: npm run db:restore');
    }
  })

  .command('up')
    .description('Run database migrations')
    .option('--backup', 'Create backup before migrating')
    .option('--force', 'Skip confirmation prompts')
    .action(async ({ options }) => {
      if (options.backup) {
        console.log('Creating backup...');
        await createBackup();
      }

      if (!options.force) {
        const confirmed = await confirm('Run migrations?');
        if (!confirmed) return;
      }

      await runMigrations();
      console.log('✅ Migrations complete!');
    });

app.run();`,
  },
  plugins: {
    title: 'Plugin System',
    description: 'Use built-in plugins for prompts, spinners, and tables.',
    category: 'Advanced',
    code: codeExamples.plugins,
  },
  'error-handling': {
    title: 'Error Handling',
    description: 'Global error handler for better error messages.',
    category: 'Advanced',
    code: codeExamples.errorHandling,
  },
  'build-tool': {
    title: 'Build Tool',
    description: 'A real-world build tool CLI.',
    category: 'Real-world Apps',
    code: `import { cli, spinner, table } from '@oxog/cli';

const app = cli('build')
  .version('2.0.0')
  .use(spinner())
  .use(table())

  .option('--config <file>', 'Config file', { default: 'build.config.js' })
  .option('--watch', 'Watch mode')

  .use((context) => {
    context.buildConfig = loadBuildConfig(context.options.config);
  })

  .command('dev')
    .description('Start development server')
    .option('--port <number>', 'Port number', { default: 3000 })
    .action(({ args, options }) => {
      console.log(\`Starting dev server on port \${options.port}...\`);
      startDevServer(options.port);
    })

  .command('build')
    .description('Build for production')
    .option('--analyze', 'Analyze bundle size')
    .action(async ({ context }) => {
      const spin = spinner();
      spin.start('Building...');

      const result = await buildProject(context.buildConfig);

      spin.succeed('Build complete!');
      table(result.stats, { columns: ['file', 'size', 'gzip'] });
    });

app.run();`,
  },
  deployment: {
    title: 'Deployment CLI',
    description: 'Deploy applications to various environments.',
    category: 'Real-world Apps',
    code: `import { cli } from '@oxog/cli';

const app = cli('deploy')
  .version('1.0.0')

  .command('prod')
    .description('Deploy to production')
    .argument('[service]', 'Specific service to deploy')
    .option('--skip-tests', 'Skip tests before deploying')
    .option('--force', 'Force deploy even if health checks fail')
    .action(async ({ args, options }) => {
      console.log('Deploying to production...');

      if (!options.skipTests) {
        console.log('Running tests...');
        await runTests();
      }

      if (args.service) {
        await deployService(args.service, { force: options.force });
      } else {
        await deployAll({ force: options.force });
      }
    })

  .command('rollback')
    .description('Rollback to previous version')
    .argument('[version]', 'Specific version to rollback to')
    .action(async ({ args }) => {
      const version = args.version || 'previous';
      console.log(\`Rolling back to \${version}...\`);
      await rollback(version);
    });

app.run();`,
  },
  database: {
    title: 'Database Tool',
    description: 'Database management and operations.',
    category: 'Real-world Apps',
    code: `import { cli } from '@oxog/cli';

const app = cli('db')
  .version('1.0.0')

  .command('migrate')
    .description('Run database migrations')
    .option('--create', 'Create new migration')
    .option('--name <name>', 'Migration name (for --create)')
    .action(async ({ options }) => {
      if (options.create) {
        await createMigration(options.name);
      } else {
        await runMigrations();
      }
    })

  .command('seed')
    .description('Seed database with initial data')
    .option('--file <path>', 'Seed file path')
    .action(async ({ options }) => {
      await seedDatabase(options.file);
    })

  .command('reset')
    .description('Reset database (drops all tables)')
    .option('--confirm <text>', 'Type "RESET" to confirm')
    .action(async ({ options }) => {
      if (options.confirm !== 'RESET') {
        console.error('Reset cancelled. Confirmation text did not match.');
        return;
      }
      await resetDatabase();
      console.log('Database reset complete.');
    });

app.run();`,
  },
};

export function ExamplesPage() {
  const { slug } = useParams<{ slug?: string }>();

  // If no slug, show the main examples listing page
  if (!slug) {
    return <MainExamplesPage />;
  }

  const example = examplesData[slug];

  if (!example) {
    return (
      <div className="container px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Example Not Found</h1>
          <p className="text-muted-foreground">Example "{slug}" not found.</p>
          <Link to="/examples" className="text-primary hover:underline mt-4 inline-block">
            ← Back to Examples
          </Link>
        </div>
      </div>
    );
  }

  return <ExampleDetail example={example} />;
}

function MainExamplesPage() {
  const categories = ['All', 'Basic', 'Intermediate', 'Advanced', 'Real-world Apps'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const examplesList = Object.entries(examplesData).map(([id, ex]) => ({ id, ...ex }));

  const filteredExamples = selectedCategory === 'All'
    ? examplesList
    : examplesList.filter(ex => ex.category === selectedCategory);

  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">Examples</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Learn by example with these practical CLI applications.
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {filteredExamples.map((example) => (
            <Link
              key={example.id}
              to={`/examples/${example.id}`}
              className="block p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{example.title}</h3>
                <span className="text-xs text-muted-foreground">{example.category}</span>
              </div>
              <p className="text-sm text-muted-foreground">{example.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExampleDetail({ example }: { example: { title: string; description: string; category: string; code: string; explanation?: string } }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(example.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/examples" className="hover:text-foreground">Examples</Link>
          <span>/</span>
          <span className="text-foreground">{example.title}</span>
        </nav>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            {example.category}
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-2">{example.title}</h1>
        <p className="text-lg text-muted-foreground mb-6">{example.description}</p>

        {example.explanation && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50">
            <p className="text-sm">{example.explanation}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Code</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-accent transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <CodeBlock
          code={example.code}
          language="typescript"
          showLineNumbers={true}
        />

        {/* Related Links */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-3">Related Documentation</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/docs/commands" className="text-primary hover:underline">
              Commands →
            </Link>
            <Link to="/docs/options" className="text-primary hover:underline">
              Options →
            </Link>
            <Link to="/docs/middleware" className="text-primary hover:underline">
              Middleware →
            </Link>
            <Link to="/docs/plugins" className="text-primary hover:underline">
              Plugins →
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/examples" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Examples
          </Link>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
