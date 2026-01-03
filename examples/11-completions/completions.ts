/**
 * Shell Completions Example
 *
 * Demonstrates generating shell completion scripts
 */

import { cli } from '../../src/index.js';

const app = cli('myapp')
  .version('1.0.0')
  .description('Shell completions example');

// Available commands
const commands = ['build', 'test', 'deploy', 'lint', 'format'];

// Available options
const options = ['--help', '--version', '--verbose', '--watch', '--output'];

app.command('completion')
  .description('Generate shell completion script')
  .argument('shell', 'Shell type (bash, zsh, fish)')
  .action(async ({ args }) => {
    const shell = args.shell;

    if (shell === 'bash') {
      console.log(`
# Bash completion for myapp
_myapp_completion() {
  local cur words commands
  cur="\${COMP_WORDS[COMP_CWORD]}"
  words=("\${COMP_WORDS[@]}")

  if [[ \${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=($(compgen -W "${commands.join(' ')}" -- "$cur"))
  else
    COMPREPLY=($(compgen -W "${options.join(' ')}" -- "$cur"))
  fi
}

complete -F _myapp_completion myapp
      `);
    } else if (shell === 'zsh') {
      console.log(`
#compdef myapp

_myapp() {
  local -a commands
  commands=(
${commands.map(c => `    '${c}:${c}'`).join('\n')}
  )

  if (( CURRENT == 2 )); then
    _describe 'command' commands
  fi
}
      `);
    } else if (shell === 'fish') {
      console.log(`
# Fish completion for myapp
complete -c myapp -f

complete -c myapp -n __fish_use_subcommand -a ${commands.join(' ')}
complete -c myapp -s h -l help -d 'Show help'
complete -c myapp -s v -l version -d 'Show version'
complete -c myapp -l verbose -d 'Verbose output'
      `);
    } else {
      console.error(`Unsupported shell: ${shell}`);
      console.error('Supported shells: bash, zsh, fish');
      process.exit(1);
    }
  });

app.command('build')
  .description('Build the project')
  .option('-o, --output <dir>', 'Output directory')
  .option('-w, --watch', 'Watch mode')
  .action(async ({ options }) => {
    console.log('Building...');
  });

app.command('deploy')
  .description('Deploy the project')
  .action(async () => {
    console.log('Deploying...');
  });

app.run();
