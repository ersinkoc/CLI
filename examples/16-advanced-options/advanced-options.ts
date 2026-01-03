/**
 * Advanced Options Example
 *
 * Demonstrates advanced option handling patterns
 */

import { cli } from '../../src/index.js';

const app = cli('myapp')
  .version('1.0.0')
  .description('Advanced options example');

app.command('types')
  .description('Various option types')
  .option('--string <value>', 'String option')
  .option('--number <value>', 'Number option', '0')
  .option('--boolean', 'Boolean flag')
  .option('--list <items>', 'Comma-separated list')
  .action(async ({ options }) => {
    console.log('Parsed options:');
    console.log('  String:', options.string);
    console.log('  Number:', typeof options.number === 'number' ? options.number : parseInt(options.number || '0'));
    console.log('  Boolean:', options.boolean === true);
    console.log('  List:', options.list ? options.list.split(',') : []);
  });

app.command('defaults')
  .description('Options with default values')
  .option('--port <number>', 'Server port', '3000')
  .option('--host <address>', 'Server host', 'localhost')
  .option('--timeout <ms>', 'Timeout in milliseconds', '5000')
  .action(async ({ options }) => {
    console.log('Configuration:');
    console.log(`  Host: ${options.host}`);
    console.log(`  Port: ${options.port}`);
    console.log(`  Timeout: ${options.timeout}ms`);
  });

app.command('choices')
  .description('Options with limited choices')
  .option('--level <level>', 'Log level (debug, info, warn, error)')
  .option('--env <env>', 'Environment (dev, staging, prod)')
  .action(async ({ options }) => {
    const validLevels = ['debug', 'info', 'warn', 'error'];
    const validEnvs = ['dev', 'staging', 'prod'];

    const level = options.level || 'info';
    const env = options.env || 'dev';

    if (!validLevels.includes(level)) {
      console.error(`Invalid level: ${level}`);
      console.error(`Valid levels: ${validLevels.join(', ')}`);
      process.exit(1);
    }

    if (!validEnvs.includes(env)) {
      console.error(`Invalid env: ${env}`);
      console.error(`Valid envs: ${validEnvs.join(', ')}`);
      process.exit(1);
    }

    console.log(`Logging at level: ${level}`);
    console.log(`Environment: ${env}`);
  });

app.command('arrays')
  .description('Array and multiple value options')
  .option('--files <paths...>', 'Input files')
  .option('--ignore <patterns...>', 'Ignore patterns')
  .action(async ({ options }) => {
    console.log('Files:', options.files || []);
    console.log('Ignore patterns:', options.ignore || []);
  });

app.command('negatable')
  .description('Negatable boolean flags')
  .option('--color', 'Enable colors')
  .option('--no-color', 'Disable colors')
  .option('--watch', 'Watch mode')
  .option('--no-watch', 'No watch mode')
  .action(async ({ options }) => {
    console.log('Color enabled:', options.color !== false);
    console.log('Watch enabled:', options.watch !== false);
  });

app.command('required')
  .description('Options with required validation')
  .option('--name <value>', 'Name (required)')
  .option('--email <value>', 'Email (required)')
  .action(async ({ options }) => {
    const required: Record<string, string> = {
      name: 'Name',
      email: 'Email',
    };

    const missing = Object.keys(required).filter(key => !options[key]);

    if (missing.length > 0) {
      console.error('Missing required options:');
      missing.forEach(key => {
        console.error(`  --${key} <${required[key]}>`);
      });
      process.exit(1);
    }

    console.log(`Name: ${options.name}`);
    console.log(`Email: ${options.email}`);
  });

app.run();
