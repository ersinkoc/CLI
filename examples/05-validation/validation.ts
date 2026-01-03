#!/usr/bin/env node

/**
 * Validation Example
 * Demonstrates argument and option validation
 */

import { cli } from '@oxog/cli';
import { colorPlugin, loggerPlugin, validationPlugin } from '@oxog/cli/plugins';

const app = cli('validation')
  .version('1.0.0')
  .describe('Validation examples')
  .use(colorPlugin())
  .use(loggerPlugin())
  .use(validationPlugin());

app
  .command('user')
  .describe('Create a user')
  .argument('<name>', 'User name')
  .argument('<email>', 'User email')
  .option('-a, --age <number>', 'User age', { type: 'number' })
  .option('-r, --role <string>', 'User role', {
    choices: ['admin', 'user', 'guest'],
  })
  .action(({ args, options, logger }) => {
    logger.info('Creating user:');
    logger.info(`  Name: ${args.name}`);
    logger.info(`  Email: ${args.email}`);
    if (options.age) {
      logger.info(`  Age: ${options.age}`);
    }
    if (options.role) {
      logger.info(`  Role: ${options.role}`);
    }
  });

app
  .command('port')
  .describe('Start server on port')
  .argument('<port>', 'Port number', { type: 'number' })
  .action(({ args, logger }) => {
    const port = args.port as number;

    if (port < 1 || port > 65535) {
      logger.error('Port must be between 1 and 65535');
      return;
    }

    logger.info(`Starting server on port ${port}`);
  });

app
  .command('range')
  .describe('Example with custom validation')
  .argument('<number>', 'A number between 1-100')
  .action(({ args, logger }) => {
    const num = args.number as number;

    if (num < 1 || num > 100) {
      logger.error('Number must be between 1 and 100');
      return;
    }

    logger.info(`Valid number: ${num}`);
  });

app.run();
