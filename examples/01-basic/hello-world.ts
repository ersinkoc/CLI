#!/usr/bin/env node

/**
 * Basic Hello World CLI
 * A minimal example showing the basics of @oxog/cli
 */

import { cli } from '@oxog/cli';

const app = cli('hello')
  .version('1.0.0')
  .describe('A simple hello world CLI');

// Add a simple command
app
  .command('greet')
  .describe('Greet someone')
  .argument('<name>', 'Name of the person to greet')
  .option('--loud', 'Shout the greeting')
  .action(({ args, options }) => {
    const message = `Hello, ${args.name}!`;

    if (options.loud) {
      console.log(message.toUpperCase());
    } else {
      console.log(message);
    }
  });

// Add a default command
app
  .command('default')
  .describe('Say hello to the world')
  .action(() => {
    console.log('Hello, World!');
  });

app.run();
