#!/usr/bin/env node

/**
 * Interactive Prompts Example
 * Demonstrates the prompt plugin for user interaction
 */

import { cli } from '@oxog/cli';
import { colorPlugin } from '@oxog/cli/plugins';

// Note: This example shows how prompts would be used
// The prompt plugin implementation would provide the prompt utilities

const app = cli('interactive')
  .version('1.0.0')
  .describe('Interactive prompts example')
  .use(colorPlugin());

app
  .command('init')
  .describe('Initialize a new project')
  .action(async ({ color }) => {
    console.log(color.cyan('Welcome to the project initializer!'));
    console.log('');

    // In a real implementation with the prompt plugin:
    // const projectName = await prompt.input({
    //   message: 'Project name:',
    //   default: 'my-project'
    // });

    // const template = await prompt.select({
    //   message: 'Choose a template:',
    //   choices: ['basic', 'react', 'vue', 'node']
    // });

    // const features = await prompt.multiselect({
    //   message: 'Select features:',
    //   choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest']
    // });

    // For now, just show what the prompt would do
    console.log(color.yellow('This example demonstrates the prompt plugin API.'));
    console.log('');
    console.log('With the prompt plugin installed, you could:');
    console.log(`  - ${color.cyan('prompt.input()')} - Get text input`);
    console.log(`  - ${color.cyan('prompt.password()')} - Get hidden input`);
    console.log(`  - ${color.cyan('prompt.confirm()')} - Get yes/no confirmation`);
    console.log(`  - ${color.cyan('prompt.select()')} - Select from choices`);
    console.log(`  - ${color.cyan('prompt.multiselect()')} - Select multiple choices`);
  });

app.run();
