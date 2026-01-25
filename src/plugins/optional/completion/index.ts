import type { CLIPlugin, CLIKernel, CLI, Command } from '../../../types.js';
import { ValidationError } from '../../../errors/cli-error.js';

/**
 * Completion plugin options
 */
export interface CompletionPluginOptions {
  /** Command name to generate completions */
  commandName?: string;
}

/**
 * Shell types
 */
export type ShellType = 'bash' | 'zsh' | 'fish';

/**
 * Generate Bash completion script
 */
function generateBashCompletion(app: CLI): string {
  const name = app.name;
  const commands = Array.from(app.commands.values());

  const commandNames = commands.map((c) => c.name).join(' ');
  const commandCompletions = commands.map((cmd) => {
    const options = cmd.options.map((o) => `--${o.name}${o.alias ? ` -${o.alias}` : ''}`).join(' ');
    return `      ${cmd.name})
        COMPREPLY=($(compgen -W "${options}" -- "\${cur}"))
        return 0
        ;;`;
  }).join('\n');

  return `# Bash completion for ${name}
# Add to ~/.bashrc or ~/.bash_completion

_${name.replace(/-/g, '_')}_completions() {
  local cur prev words cword
  _init_completion || return

  local commands="${commandNames}"

  case "\${cword}" in
    1)
      COMPREPLY=($(compgen -W "\${commands}" -- "\${cur}"))
      return 0
      ;;
    *)
      case "\${words[1]}" in
${commandCompletions}
      esac
      ;;
  esac
}

complete -F _${name.replace(/-/g, '_')}_completions ${name}
`;
}

/**
 * Generate Zsh completion script
 */
function generateZshCompletion(app: CLI): string {
  const name = app.name;
  const commands = Array.from(app.commands.values());

  const commandList = commands.map((cmd) => {
    const desc = cmd.description?.replace(/'/g, "\\'") || cmd.name;
    return `    '${cmd.name}:${desc}'`;
  }).join(' \\\n');

  const commandCases = commands.map((cmd) => {
    const options = cmd.options.map((o) => {
      const desc = o.description?.replace(/'/g, "\\'") || o.name;
      const alias = o.alias ? `{-${o.alias},--${o.name}}` : `--${o.name}`;
      return `        '${alias}[${desc}]'`;
    }).join(' \\\n');

    return `      ${cmd.name})
        _arguments -s \\
${options || "          '*:file:_files'"}
        ;;`;
  }).join('\n');

  return `#compdef ${name}
# Zsh completion for ${name}
# Add to ~/.zshrc or place in $fpath

_${name.replace(/-/g, '_')}() {
  local -a commands
  commands=(
${commandList}
  )

  _arguments -C \\
    '1:command:->commands' \\
    '*::arg:->args'

  case "$state" in
    commands)
      _describe -t commands 'command' commands
      ;;
    args)
      case "\${words[1]}" in
${commandCases}
      esac
      ;;
  esac
}

_${name.replace(/-/g, '_')} "$@"
`;
}

/**
 * Generate Fish completion script
 */
function generateFishCompletion(app: CLI): string {
  const name = app.name;
  const commands = Array.from(app.commands.values());

  const commandCompletions = commands.map((cmd) => {
    const desc = cmd.description?.replace(/'/g, "\\'") || cmd.name;
    return `complete -c ${name} -n __fish_use_subcommand -a ${cmd.name} -d '${desc}'`;
  }).join('\n');

  const optionCompletions = commands.flatMap((cmd) => {
    return cmd.options.map((o) => {
      const desc = o.description?.replace(/'/g, "\\'") || o.name;
      const short = o.alias ? `-s ${o.alias} ` : '';
      return `complete -c ${name} -n "__fish_seen_subcommand_from ${cmd.name}" ${short}-l ${o.name} -d '${desc}'`;
    });
  }).join('\n');

  return `# Fish completion for ${name}
# Add to ~/.config/fish/completions/${name}.fish

# Disable file completion by default
complete -c ${name} -f

# Commands
${commandCompletions}

# Options
${optionCompletions}
`;
}

/**
 * Detect current shell
 */
function detectShell(): ShellType {
  const shell = process.env.SHELL || '';

  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('fish')) return 'fish';
  return 'bash';
}

/**
 * Get completion installation instructions
 */
function getInstallInstructions(shell: ShellType, name: string): string {
  switch (shell) {
    case 'bash':
      return `# Add to ~/.bashrc or ~/.bash_completion:
${name} completion bash >> ~/.bashrc
# Or save to a file:
${name} completion bash > /etc/bash_completion.d/${name}`;

    case 'zsh':
      return `# Add to ~/.zshrc or save to fpath:
${name} completion zsh > ~/.zsh/completions/_${name}
# Then add to ~/.zshrc:
fpath=(~/.zsh/completions $fpath)
autoload -Uz compinit && compinit`;

    case 'fish':
      return `# Save to fish completions directory:
${name} completion fish > ~/.config/fish/completions/${name}.fish`;
  }
}

/**
 * Completion utilities interface
 */
export interface CompletionUtils {
  /** Generate completion script for a shell */
  generate(shell?: ShellType): string;
  /** Get installation instructions */
  instructions(shell?: ShellType): string;
  /** Detect current shell */
  detectShell(): ShellType;
}

/**
 * Completion plugin
 * Provides shell completion generation
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { completionPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(completionPlugin());
 *
 * // This adds a 'completion' command that generates shell scripts
 * // Usage: myapp completion bash
 * //        myapp completion zsh
 * //        myapp completion fish
 * ```
 */
export function completionPlugin(options: CompletionPluginOptions = {}): CLIPlugin {
  const commandName = options.commandName || 'completion';

  return {
    name: 'completion',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      // Add completion utilities to context
      kernel.on('command:before', async (data: any) => {
        const app = data.context.app as CLI;

        const completionUtils: CompletionUtils = {
          generate: (shell?: ShellType) => {
            const targetShell = shell || detectShell();
            switch (targetShell) {
              case 'bash':
                return generateBashCompletion(app);
              case 'zsh':
                return generateZshCompletion(app);
              case 'fish':
                return generateFishCompletion(app);
            }
          },
          instructions: (shell?: ShellType) => {
            return getInstallInstructions(shell || detectShell(), app.name);
          },
          detectShell,
        };

        data.context.completion = completionUtils;
      });
    },

    onInit(context: any) {
      const app = context.app as CLI;

      // Add completion command
      if (app && typeof app.command === 'function') {
        app.command(commandName)
          .describe('Generate shell completion script')
          .argument('[shell]', 'Shell type (bash, zsh, fish)')
          .option('--install', 'Show installation instructions')
          .action(({ args, options }: any) => {
            const shell = (args.shell as ShellType) || detectShell();

            if (!['bash', 'zsh', 'fish'].includes(shell)) {
              throw new ValidationError(
                `Unknown shell: ${shell}. Supported shells: bash, zsh, fish`
              );
            }

            if (options.install) {
              console.log(getInstallInstructions(shell, app.name));
            } else {
              let script: string;
              switch (shell) {
                case 'bash':
                  script = generateBashCompletion(app);
                  break;
                case 'zsh':
                  script = generateZshCompletion(app);
                  break;
                case 'fish':
                  script = generateFishCompletion(app);
                  break;
                default:
                  script = generateBashCompletion(app);
              }
              console.log(script);
            }
          });
      }
    },
  };
}

// Export generators for direct use
export { generateBashCompletion, generateZshCompletion, generateFishCompletion, detectShell };
