#!/usr/bin/env node

/**
 * Create App CLI
 * A real-world example similar to create-react-app, create-vite, etc.
 */

import { cli } from '@oxog/cli';
import { colorPlugin, spinnerPlugin } from '@oxog/cli/plugins';

const app = cli('create-app')
  .version('1.0.0')
  .describe('Create a new application')
  .use(colorPlugin())
  .use(spinnerPlugin());

// Template definitions
const templates = {
  'vanilla-ts': 'Vanilla TypeScript',
  'react': 'React + TypeScript',
  'vue': 'Vue 3 + TypeScript',
  'svelte': 'Svelte + TypeScript',
  'solid': 'Solid + TypeScript',
};

app
  .command('create')
  .alias('c')
  .describe('Create a new application')
  .argument('[name]', 'Project name', { default: 'my-app' })
  .option('-t, --template <name>', 'Template to use', {
    choices: Object.keys(templates),
    default: 'vanilla-ts',
  })
  .option('-p, --package-manager <name>', 'Package manager', {
    choices: ['npm', 'yarn', 'pnpm'],
  })
  .option('--git', 'Initialize git repository', { type: 'boolean', default: true })
  .option('--install', 'Install dependencies', { type: 'boolean', default: true })
  .action(async ({ args, options, spinner, color }) => {
    const projectName = args.name as string;
    const template = options.template as keyof typeof templates;

    console.log('');
    console.log(color.cyan.bold(`✨ Creating ${projectName}...`));
    console.log('');

    // Show selected template
    console.log(`Template: ${color.yellow(templates[template])}`);

    // Show project name
    console.log(`Project name: ${color.yellow(projectName)}`);

    // Simulate creation process
    console.log('');
    const spin1 = spinner.start('Creating project structure...');
    await new Promise((resolve) => setTimeout(resolve, 800));
    spin1.succeed('Project structure created');

    const spin2 = spinner.start('Writing files...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    spin2.succeed('Files written');

    if (options.git) {
      const spin3 = spinner.start('Initializing git...');
      await new Promise((resolve) => setTimeout(resolve, 500));
      spin3.succeed('Git initialized');
    }

    if (options.install) {
      const pm = options.packageManager || 'npm';
      const spin4 = spinner.start(`Installing dependencies with ${pm}...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      spin4.succeed('Dependencies installed');
    }

    console.log('');
    console.log(color.green.bold('✓ Project created successfully!'));
    console.log('');
    console.log(color.bold('Next steps:'));
    console.log(`  ${color.cyan(`cd ${projectName}`)}`);
    console.log(`  ${color.cyan(`${options.packageManager || 'npm'} start`)}`);
    console.log('');
  });

app.run();
