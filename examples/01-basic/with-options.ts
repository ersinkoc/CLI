#!/usr/bin/env node

/**
 * CLI with Options
 * Demonstrates various option types
 */

import { cli } from '@oxog/cli';
import { colorPlugin, loggerPlugin } from '@oxog/cli/plugins';

const app = cli('options-example')
  .version('1.0.0')
  .describe('Example showing various option types')
  .use(colorPlugin())
  .use(loggerPlugin());

// Add global options
app
  .option('-v, --verbose', 'Enable verbose output')
  .option('-q, --quiet', 'Suppress output')
  .option('-d, --debug', 'Enable debug mode');

// Command with number option
app
  .command('server')
  .describe('Start a server')
  .option('-p, --port <number>', 'Port number', { type: 'number', default: 3000 })
  .option('-h, --host <string>', 'Host address', { default: 'localhost' })
  .action(({ options, logger }) => {
    const { port, host } = options;

    if (!options.quiet) {
      logger.info(`Starting server on ${host}:${port}`);
    }

    if (options.debug) {
      logger.debug(`Debug mode enabled`);
    }
  });

// Command with boolean flag
app
  .command('build')
  .describe('Build the project')
  .option('-w, --watch', 'Watch for changes')
  .option('-p, --production', 'Production build')
  .option('-s, --source-map', 'Generate source maps')
  .action(({ options, logger }) => {
    logger.info('Building...');

    if (options.watch) {
      logger.info('Watch mode enabled');
    }

    if (options.production) {
      logger.info('Production build');
    }

    if (options.sourceMap) {
      logger.info('Source maps will be generated');
    }
  });

// Command with array option
app
  .command('install')
  .describe('Install packages')
  .option('-p, --packages <names...>', 'Package names', { type: 'array' })
  .option('-D, --save-dev', 'Save as dev dependency')
  .action(({ options, logger }) => {
    const packages = (options.packages as string[]) || [];

    if (packages.length === 0) {
      logger.warn('No packages specified');
      return;
    }

    logger.info(`Installing: ${packages.join(', ')}`);

    if (options.saveDev) {
      logger.info('Saving as dev dependencies');
    }
  });

app.run();
