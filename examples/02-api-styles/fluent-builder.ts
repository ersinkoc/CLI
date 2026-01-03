#!/usr/bin/env node

/**
 * Fluent Builder API Example
 * The primary API style for @oxog/cli
 */

import { cli } from '@oxog/cli';
import { colorPlugin, spinnerPlugin, loggerPlugin } from '@oxog/cli/plugins';

const app = cli('myapp')
  .version('1.0.0')
  .describe('Fluent Builder API example')
  .use(colorPlugin())
  .use(spinnerPlugin())
  .use(loggerPlugin());

// Chain methods to build your CLI
app
  .command('build')
  .describe('Build the project')
  .argument('[input]', 'Input directory', { default: 'src' })
  .option('-o, --output <dir>', 'Output directory', { default: 'dist' })
  .option('-w, --watch', 'Watch mode')
  .option('-m, --minify', 'Minify output')
  .action(async ({ args, options, spinner, logger }) => {
    logger.info(`Building from ${args.input} to ${options.output}`);

    const spin = spinner.start('Compiling...');
    // Simulate build
    await new Promise((resolve) => setTimeout(resolve, 1000));
    spin.succeed('Compiled successfully');

    if (options.minify) {
      const spin2 = spinner.start('Minifying...');
      await new Promise((resolve) => setTimeout(resolve, 500));
      spin2.succeed('Minified');
    }

    logger.info('Build complete!');
  });

// Add aliases
app
  .command('deploy')
  .alias('d', 'publish')
  .describe('Deploy to production')
  .action(async ({ spinner }) => {
    const spin = spinner.start('Deploying...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    spin.succeed('Deployed!');
  });

app.run();
