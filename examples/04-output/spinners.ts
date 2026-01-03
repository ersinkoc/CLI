#!/usr/bin/env node

/**
 * Spinners Example
 * Demonstrates loading spinners and progress indicators
 */

import { cli } from '@oxog/cli';
import { spinnerPlugin, colorPlugin } from '@oxog/cli/plugins';

const app = cli('spinners')
  .version('1.0.0')
  .describe('Spinner examples')
  .use(spinnerPlugin())
  .use(colorPlugin());

app
  .command('basic')
  .describe('Basic spinner example')
  .action(async ({ spinner }) => {
    const spin = spinner.start('Loading...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    spin.succeed('Done!');
  });

app
  .command('states')
  .describe('Different spinner states')
  .action(async ({ spinner }) => {
    // Success
    const s1 = spinner.start('Task 1...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    s1.succeed('Task 1 completed!');

    // Failure
    const s2 = spinner.start('Task 2...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    s2.fail('Task 2 failed!');

    // Warning
    const s3 = spinner.start('Task 3...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    s3.warn('Task 3 had warnings');

    // Info
    const s4 = spinner.start('Task 4...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    s4.info('Task 4 info');
  });

app
  .command('workflow')
  .describe('Multi-step workflow')
  .action(async ({ spinner }) => {
    const steps = [
      'Fetching dependencies...',
      'Compiling source...',
      'Running tests...',
      'Building output...',
      'Deploying...',
    ];

    for (const step of steps) {
      const spin = spinner.start(step);
      await new Promise((resolve) => setTimeout(resolve, 800));
      spin.succeed(step.replace('...', 'done!'));
    }
  });

app.run();
