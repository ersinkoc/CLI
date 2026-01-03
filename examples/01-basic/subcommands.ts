#!/usr/bin/env node

/**
 * CLI with Nested Subcommands
 * Demonstrates command hierarchy and navigation
 */

import { cli } from '@oxog/cli';
import { colorPlugin, spinnerPlugin } from '@oxog/cli/plugins';

const app = cli('config-cli')
  .version('1.0.0')
  .describe('A CLI for managing configuration')
  .use(colorPlugin())
  .use(spinnerPlugin());

// Main config command with subcommands
const configCmd = app
  .command('config')
  .describe('Manage configuration');

configCmd
  .command('get')
  .describe('Get a config value')
  .argument('<key>', 'Config key to retrieve')
  .action(({ args, color }) => {
    console.log(`Config value for ${color.cyan(args.key as string)}: <value>`);
  });

configCmd
  .command('set')
  .describe('Set a config value')
  .argument('<key>', 'Config key to set')
  .argument('<value>', 'Value to set')
  .action(({ args, spinner }) => {
    const spin = spinner.start(`Setting ${args.key}...`);
    // Simulate async operation
    setTimeout(() => {
      spin.succeed(`Set ${args.key} = ${args.value}`);
    }, 500);
  });

configCmd
  .command('list')
  .describe('List all config values')
  .action(({ color }) => {
    console.log('Configuration:');
    console.log(`  ${color.cyan('name')}: myapp`);
    console.log(`  ${color.cyan('version')}: 1.0.0`);
    console.log(`  ${color.cyan('debug')}: false`);
  });

configCmd
  .command('delete')
  .describe('Delete a config value')
  .argument('<key>', 'Config key to delete')
  .action(({ args, color, spinner }) => {
    const spin = spinner.start(`Deleting ${args.key}...`);
    setTimeout(() => {
      spin.succeed(color.green(`Deleted ${args.key}`));
    }, 500);
  });

// Another command group - create user command and add subcommands
const userCmd = app
  .command('user')
  .describe('Manage users');

userCmd
  .command('add')
  .describe('Add a new user')
  .argument('<username>', 'Username')
  .action(({ args, spinner }) => {
    const spin = spinner.start(`Adding user ${args.username}...`);
    setTimeout(() => {
      spin.succeed(`User ${args.username} added`);
    }, 500);
  });

userCmd
  .command('remove')
  .describe('Remove a user')
  .argument('<username>', 'Username')
  .action(({ args, spinner }) => {
    const spin = spinner.start(`Removing user ${args.username}...`);
    setTimeout(() => {
      spin.succeed(`User ${args.username} removed`);
    }, 500);
  });

userCmd
  .command('list')
  .describe('List all users')
  .action(({ color }) => {
    console.log('Users:');
    console.log(`  - ${color.cyan('alice')}`);
    console.log(`  - ${color.cyan('bob')}`);
    console.log(`  - ${color.cyan('charlie')}`);
  });

app.run();
