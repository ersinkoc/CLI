import { useParams } from 'react-router-dom';
import { CodeBlock } from '@/components/CodeBlock';
import { cn } from '@/lib/utils';

// Markdown parser for API content
function parseMarkdown(content: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';
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
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/g);

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

    // Code blocks
    if (trimmed.startsWith('```')) {
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
    if (!trimmed.startsWith('-') && inList) {
      flushList();
    }

    // Headers
    if (trimmed.startsWith('#')) {
      flushList();
      const match = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold markdown
        const id = text.toLowerCase().replace(/\s+/g, '-');
        const Tag = `h${level}` as keyof JSX.IntrinsicElements;
        elements.push(
          <Tag key={idx} id={id} className={cn(
            'font-semibold tracking-tight scroll-mt-20',
            level === 1 ? 'text-2xl sm:text-3xl mt-8 mb-4' : '',
            level === 2 ? 'text-xl sm:text-2xl mt-6 mb-3' : '',
            level === 3 ? 'text-lg sm:text-xl mt-4 mb-2' : ''
          )}>
            {parseInline(text)}
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

    // Regular content
    if (trimmed) {
      flushList();
      elements.push(
        <p key={idx} className="my-4 leading-7 text-base text-muted-foreground">
          {parseInline(line)}
        </p>
      );
    }
  });

  flushCode();
  flushList();
  return <>{elements}</>;
}

const apiData: Record<string, { title: string; content: string; code?: string }> = {
  cli: {
    title: 'CLI Class',
    content: `The main CLI class that provides the fluent builder API for creating command-line interfaces.

**Constructor**
\`\`\`typescript
new CLI(name: string, options?: CLIOptions)
\`\`\`

**Methods**
- **version(v: string)** - Sets the version of the CLI
- **description(d: string)** - Sets the description of the CLI
- **command(name: string)** - Creates a new command with the given name
- **option(flags: string, desc?: string)** - Adds a global option
- **use(plugin: CLIPlugin)** - Registers a plugin
- **run(argv?: string[])** - Parses arguments and executes the CLI`,
    code: `import { cli } from '@oxog/cli';

const app = cli('myapp')
  .version('1.0.0')
  .description('My CLI application')
  .command('build')
    .action(() => {
      console.log('Building...');
    });

app.run();`,
  },
  command: {
    title: 'Command Class',
    content: `Represents a command with its configuration and handler.

**Methods**
- **execute(context: ActionContext)** - Executes the command with the given context
- **findCommand(path: string[])** - Finds a subcommand by path
- **addCommand(command: Command)** - Adds a subcommand`,
  },
  'command-builder': {
    title: 'CommandBuilder Class',
    content: `Builder class for configuring commands with a fluent API.

**Methods**
- **description(desc: string)** - Sets the command description
- **argument(name: string, desc?: string)** - Adds an argument to the command
- **option(flags: string, desc?: string)** - Adds an option to the command
- **action(handler: Function)** - Sets the action handler for the command
- **use(middleware: Function)** - Adds middleware to the command
- **command(name: string)** - Creates a subcommand`,
  },
  kernel: {
    title: 'CLIKernel Class',
    content: `The micro-kernel that manages plugins and events.

**Methods**
- **register(plugin: CLIPlugin)** - Registers a plugin
- **unregister(name: string)** - Unregisters a plugin by name
- **emit(event: string, data: any)** - Emits an event
- **on(event: string, handler: Function)** - Adds an event listener
- **getConfig()** - Returns the current configuration`,
  },
  'cli-options': {
    title: 'CLIOptions Interface',
    content: `Configuration options for creating a CLI instance.

**Properties**
- **name: string** - The name of the CLI application
- **version?: string** - The version string
- **description?: string** - A short description`,
  },
  'command-def': {
    title: 'CommandDef Interface',
    content: `Definition of a command.

**Properties**
- **name: string** - The command name
- **description?: string** - Command description
- **aliases?: string[]** - Alternative names
- **arguments?: ArgumentDef[]** - Command arguments
- **options?: OptionDef[]** - Command options`,
  },
  'argument-def': {
    title: 'ArgumentDef Interface',
    content: `Definition of a command argument.

**Properties**
- **name: string** - Argument name (e.g., \`<file>\` or \`[file]\`)
- **description?: string** - Argument description
- **required?: boolean** - Whether the argument is required
- **default?: any** - Default value`,
  },
  'option-def': {
    title: 'OptionDef Interface',
    content: `Definition of a command option.

**Properties**
- **flags: string** - Option flags (e.g., \`-v, --verbose\`)
- **description?: string** - Option description
- **required?: boolean** - Whether the option is required
- **default?: any** - Default value
- **choices?: string[]** - Allowed values`,
  },
  plugin: {
    title: 'CLIPlugin Type',
    content: `A plugin function that extends CLI functionality.

\`\`\`typescript
type CLIPlugin = (kernel: CLIKernel) => void | Promise<void>;
\`\`\`

**Example**
\`\`\`typescript
const myPlugin: CLIPlugin = (kernel) => {
  kernel.on('command:start', (ctx) => {
    console.log(\`Starting: \${ctx.command.name}\`);
  });
};

app.use(myPlugin);
\`\`\``,
  },
  'action-context': {
    title: 'ActionContext Interface',
    content: `Context passed to command action handlers.

**Properties**
- **command: Command** - The command being executed
- **args: ParsedArguments** - Parsed argument values
- **options: ParsedOptions** - Parsed option values
- **unknown: string[]** - Unknown arguments`,
  },
  'cli-function': {
    title: 'cli() Function',
    content: `Creates a new CLI instance with the fluent builder API.

\`\`\`typescript
function cli(name: string): CLI
function cli(options: CLIOptions): CLI
\`\`\`

**Example**
\`\`\`typescript
const app = cli('myapp');
// or
const app = cli({ name: 'myapp', version: '1.0.0' });
\`\`\``,
  },
  'command-decorator': {
    title: '@Command Decorator',
    content: `Decorator for defining commands in class-based CLIs.

\`\`\`typescript
@Command(options?: CommandOptions)
\`\`\`

**Example**
\`\`\`typescript
@Command({ description: 'Build the project' })
build(@Argument('<pattern>') pattern: string) {
  console.log(\`Building \${pattern}...\`);
}
\`\`\``,
  },
  'option-decorator': {
    title: '@Option Decorator',
    content: `Decorator for injecting option values in class-based CLIs.

\`\`\`typescript
@Option(flags: string, description?: string)
\`\`\`

**Example**
\`\`\`typescript
@Command({ description: 'Run tests' })
test(
  @Option('--coverage') coverage: boolean,
  @Option('--filter <pattern>') filter?: string
) {
  if (coverage) console.log('Coverage enabled');
}
\`\`\``,
  },
  'argument-decorator': {
    title: '@Argument Decorator',
    content: `Decorator for injecting argument values in class-based CLIs.

\`\`\`typescript
@Argument(name: string, description?: string)
\`\`\`

**Example**
\`\`\`typescript
@Command({ description: 'Greet someone' })
greet(@Argument('<name>') name: string) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\``,
  },
  'parsed-arguments': {
    title: 'ParsedArguments Type',
    content: `Parsed argument values passed to action handlers.

\`\`\`typescript
type ParsedArguments = Record<string, unknown>;
\`\`\`

Arguments are coerced to their defined types (string, number, boolean).`,
  },
  'parsed-options': {
    title: 'ParsedOptions Type',
    content: `Parsed option values passed to action handlers.

\`\`\`typescript
type ParsedOptions = Record<string, unknown>;
\`\`\`

Options are coerced to their defined types. Boolean options default to \`false\` unless the flag is present.`,
  },
  coercer: {
    title: 'Coercer Type',
    content: `A function that converts a string value to another type.

\`\`\`typescript
type Coercer = (value: string) => unknown;
\`\`\`

**Example**
\`\`\`typescript
const parsePort: Coercer = (value) => {
  const num = Number(value);
  if (isNaN(num) || num < 1 || num > 65535) {
    throw new Error('Invalid port number');
  }
  return num;
};

.argument('<port>', 'Port number', { coerce: parsePort })
\`\`\``,
  },
  validator: {
    title: 'Validator Type',
    content: `A function that validates a value and returns an error message if invalid.

\`\`\`typescript
type Validator = (value: unknown) => true | string;
\`\`\`

**Example**
\`\`\`typescript
const isPort: Validator = (value) => {
  if (typeof value !== 'number' || value < 1 || value > 65535) {
    return 'Must be a valid port number (1-65535)';
  }
  return true;
};

.option('--port <number>', 'Port number', {
  coerce: Number,
  validate: isPort
})
\`\`\``,
  },
};

export function APIPage() {
  const { slug } = useParams<{ slug?: string }>();

  // If no slug, show the main API reference page
  if (!slug) {
    return <MainAPIPage />;
  }

  const data = apiData[slug];

  if (!data) {
    return (
      <div className="container px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Not Found</h1>
          <p className="text-muted-foreground">API documentation for "{slug}" not found.</p>
          <a href="/api" className="text-primary hover:underline mt-4 inline-block">
            ← Back to API Reference
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <a href="/api" className="hover:text-foreground">API</a>
          <span>/</span>
          <span className="text-foreground">{data.title}</span>
        </nav>

        <h1 className="text-4xl font-bold mb-4">{data.title}</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {parseMarkdown(data.content)}
        </div>

        {data.code && (
          <div className="mt-8">
            <CodeBlock
              code={data.code}
              language="typescript"
              showLineNumbers={true}
            />
          </div>
        )}

        <div className="mt-12 pt-8 border-t">
          <a href="/api" className="text-primary hover:underline">
            ← Back to API Reference
          </a>
        </div>
      </div>
    </div>
  );
}

function MainAPIPage() {
  return (
    <div className="container px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">API Reference</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Complete API reference for @oxog/cli classes, interfaces, and types.
        </p>

        {/* Classes */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Classes</h2>
          <div className="space-y-3">
            {[
              { id: 'cli', name: 'CLI', desc: 'The main CLI class with fluent builder API' },
              { id: 'command', name: 'Command', desc: 'Represents a command with configuration' },
              { id: 'command-builder', name: 'CommandBuilder', desc: 'Builder for configuring commands' },
              { id: 'kernel', name: 'CLIKernel', desc: 'Micro-kernel for plugins and events' },
            ].map((cls) => (
              <a key={cls.id} href={`/api/${cls.id}`} className="block p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold text-primary">{cls.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{cls.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Interfaces */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Interfaces</h2>
          <div className="space-y-3">
            {[
              { id: 'cli-options', name: 'CLIOptions', desc: 'Configuration options for CLI' },
              { id: 'command-def', name: 'CommandDef', desc: 'Definition of a command' },
              { id: 'argument-def', name: 'ArgumentDef', desc: 'Definition of a command argument' },
              { id: 'option-def', name: 'OptionDef', desc: 'Definition of a command option' },
              { id: 'plugin', name: 'CLIPlugin', desc: 'Plugin function type' },
              { id: 'action-context', name: 'ActionContext', desc: 'Context passed to handlers' },
            ].map((iface) => (
              <a key={iface.id} href={`/api/${iface.id}`} className="block p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold text-primary">{iface.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{iface.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Functions & Decorators */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Functions & Decorators</h2>
          <div className="space-y-3">
            {[
              { id: 'cli-function', name: 'cli()', desc: 'Creates a new CLI instance' },
              { id: 'command-decorator', name: '@Command', desc: 'Decorator for defining commands' },
              { id: 'option-decorator', name: '@Option', desc: 'Decorator for injecting options' },
              { id: 'argument-decorator', name: '@Argument', desc: 'Decorator for injecting arguments' },
            ].map((item) => (
              <a key={item.id} href={`/api/${item.id}`} className="block p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold text-primary">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Types */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Type Aliases</h2>
          <div className="space-y-3">
            {[
              { id: 'parsed-arguments', name: 'ParsedArguments', desc: 'Parsed argument values' },
              { id: 'parsed-options', name: 'ParsedOptions', desc: 'Parsed option values' },
              { id: 'coercer', name: 'Coercer', desc: 'Type coercion function' },
              { id: 'validator', name: 'Validator', desc: 'Validation function' },
            ].map((type) => (
              <a key={type.id} href={`/api/${type.id}`} className="block p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold text-primary">{type.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{type.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
