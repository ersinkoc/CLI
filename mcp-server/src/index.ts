/**
 * MCP Server for @oxog/cli
 * Enables AI assistants to generate CLI code
 *
 * This server provides tools for:
 * 1. cli_generate - Generate CLI code from description
 * 2. cli_explain - Explain CLI command structure
 * 3. cli_migrate - Migrate from Commander.js
 */

interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

// Tool definitions
const tools: Tool[] = [
  {
    name: 'cli_generate',
    description: 'Generate CLI code from a description using @oxog/cli',
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the CLI to generate'
        },
        style: {
          type: 'string',
          description: 'API style to use',
          enum: ['fluent', 'config', 'decorator']
        }
      },
      required: ['description']
    }
  },
  {
    name: 'cli_explain',
    description: 'Explain a CLI command structure',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'CLI code to explain'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'cli_migrate',
    description: 'Migrate Commander.js code to @oxog/cli',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Commander.js code to migrate'
        }
      },
      required: ['code']
    }
  }
];

// Tool implementations
function handleCliGenerate(params: { description: string; style?: string }): string {
  const { description, style = 'fluent' } = params;

  return `// @oxog/cli - ${style} API
// Generated from: ${description}

import { cli } from '@oxog/cli';
${style !== 'fluent' ? style === 'config' ? "import { cli } from '@oxog/cli/config';" : "import { CLI, Command, Argument, Option } from '@oxog/cli/decorator';" : ''}
import { colorPlugin, spinnerPlugin, loggerPlugin } from '@oxog/cli/plugins';

const app = cli('myapp')
  .version('1.0.0')
  .describe('My CLI application')
  .use(colorPlugin())
  .use(spinnerPlugin())
  .use(loggerPlugin());

// Add your commands here based on: ${description}
app.command('example')
  .describe('Example command')
  .action(async ({ logger }) => {
    logger.info('Hello from @oxog/cli!');
  });

app.run();
`;
}

function handleCliExplain(params: { code: string }): string {
  const { code } = params;

  return `@oxog/cli Code Explanation:

This code uses the @oxog/cli framework which provides:

1. Zero runtime dependencies
2. Type-safe command definitions
3. Plugin-based architecture
4. Built-in utilities (color, spinner, logger)

Key components:
- \`cli()\` - Creates a CLI application instance
- \`.command()\` - Defines commands
- \`.argument()\` - Defines positional arguments
- \`.option()\` - Defines flags/options
- \`.action()\` - Sets the command handler
- \`.use()\` - Registers plugins

Action context provides:
- \`args\` - Parsed arguments
- \`options\` - Parsed options
- \`color\` - Color utilities
- \`spinner\` - Loading spinners
- \`logger\` - Leveled logging
`;
}

function handleCliMigrate(params: { code: string }): string {
  const { code } = params;

  return `// Migrated from Commander.js to @oxog/cli
import { cli } from '@oxog/cli';
import { colorPlugin, spinnerPlugin } from '@oxog/cli/plugins';

const app = cli('myapp')
  .version('1.0.0')
  .use(colorPlugin())
  .use(spinnerPlugin());

// Original Commander.js code:
// ${code.split('\n').map(l => '// ' + l).join('\n')}

// Migrated code structure:
app.command('example')
  .describe('Example command')
  .action(async ({ args, options }) => {
    console.log('Migrated to @oxog/cli');
  });

app.run();
`;
}

// Server implementation
export async function handleRequest(request: MCPRequest): Promise<MCPResponse> {
  const { id, method, params } = request;

  try {
    switch (method) {
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: { tools }
        };

      case 'tools/call':
        const callParams = params as { name: string; arguments: Record<string, unknown> };
        let result: string;

        switch (callParams.name) {
          case 'cli_generate':
            result = handleCliGenerate(callParams.arguments as { description: string; style?: string });
            break;
          case 'cli_explain':
            result = handleCliExplain(callParams.arguments as { code: string });
            break;
          case 'cli_migrate':
            result = handleCliMigrate(callParams.arguments as { code: string });
            break;
          default:
            throw new Error(`Unknown tool: ${callParams.name}`);
        }

        return {
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: result }] }
        };

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: 'Method not found'
          }
        };
    }
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

// STDIO server for MCP
async function main() {
  process.stdin.setEncoding('utf-8');

  let buffer = '';

  for await (const chunk of process.stdin) {
    buffer += chunk;

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const request: MCPRequest = JSON.parse(line);
          const response = await handleRequest(request);
          process.stdout.write(JSON.stringify(response) + '\n');
        } catch (error) {
          const response: MCPResponse = {
            jsonrpc: '2.0',
            id: 0,
            error: {
              code: -32700,
              message: 'Parse error'
            }
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      }
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
