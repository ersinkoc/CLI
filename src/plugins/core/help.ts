import type { CLIPlugin, CLIKernel } from '../../types.js';
import type { CLI } from '../../types.js';
import { colors } from '../../utils/ansi.js';
import { HelpRequestedExit } from '../../errors/cli-error.js';

/**
 * Help plugin options
 */
export interface HelpPluginOptions {
  /** Custom help formatter */
  format?: (context: HelpContext) => string;
}

/**
 * Help context
 */
export interface HelpContext {
  /** CLI application */
  app: CLI;
  /** Current command (if showing command help) */
  command?: string;
}

/**
 * Create help plugin
 *
 * @param options - Plugin options
 * @returns Help plugin
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { helpPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(helpPlugin());
 * ```
 */
export function helpPlugin(options: HelpPluginOptions = {}): CLIPlugin {
  return {
    name: 'help',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      // Listen for help event
      kernel.on('help', async (...args: unknown[]) => {
        const context = args[0] as HelpContext;
        const helpText = options.format
          ? options.format(context)
          : formatHelp(context);
        console.log(helpText);
      });

      // Listen for command:before to check for --help
      kernel.on('command:before', async (...args: unknown[]) => {
        const data = args[0] as any;
        const { context } = data;
        if (context.options?.help === true) {
          await kernel.emit('help', { app: context.app });
          // Throw instead of process.exit to allow library users to handle gracefully
          throw new HelpRequestedExit();
        }
      });
    },
  };
}

/**
 * Default help formatter
 */
function formatHelp(context: HelpContext): string {
  const { app } = context;
  const lines: string[] = [];

  // Title
  lines.push('');
  const description = app.description();
  if (description) {
    lines.push(colors.bold(description));
  } else {
    lines.push(colors.bold(app.name));
  }

  // Usage
  lines.push('');
  lines.push(colors.underline('Usage:'));
  lines.push(`  $ ${app.name} [command] [options]`);

  // Commands
  if (app.commands.size > 0) {
    lines.push('');
    lines.push(colors.underline('Commands:'));
    for (const [name, cmd] of app.commands) {
      const desc = cmd.description || '';
      lines.push(`  ${colors.cyan(name.padEnd(15))}  ${desc}`);
    }
  }

  // Options
  if (app.options.length > 0) {
    lines.push('');
    lines.push(colors.underline('Options:'));
    for (const opt of app.options) {
      const flags = formatOptionFlags(opt);
      const desc = opt.description || '';
      lines.push(`  ${colors.yellow(flags.padEnd(20))}  ${desc}`);
    }
  }

  // Help option
  lines.push('');
  lines.push(colors.underline('Help:'));
  lines.push(`  ${colors.yellow('-h, --help'.padEnd(20))}  Show this help message`);

  lines.push('');
  return lines.join('\n');
}

/**
 * Format option flags for display
 */
function formatOptionFlags(opt: any): string {
  let flags = '';
  if (opt.alias) {
    flags += `-${opt.alias}, `;
  }
  flags += `--${opt.name}`;
  if (opt.type !== 'boolean') {
    flags += ` <${opt.type || 'value'}>`;
  }
  return flags;
}
