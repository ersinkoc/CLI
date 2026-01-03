/**
 * Error Handling Example
 *
 * Demonstrates comprehensive error handling patterns
 */

import { cli } from '../../src/index.js';

const app = cli('myapp')
  .version('1.0.0')
  .description('Error handling example');

// Command with try-catch
app.command('safe')
  .description('Safe command with manual error handling')
  .action(async () => {
    try {
      // Simulate operation that might fail
      if (Math.random() > 0.5) {
        throw new Error('Random failure occurred');
      }
      console.log('Operation succeeded!');
    } catch (error) {
      console.error('Caught error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Command that throws
app.command('unsafe')
  .description('Command that throws (will be caught by framework)')
  .action(async () => {
    throw new Error('This command always fails!');
  });

// Command with validation
app.command('validate')
  .description('Command with input validation')
  .argument('name', 'Name to validate')
  .action(async ({ args }) => {
    if (!args.name || args.name.length < 3) {
      console.error('Error: Name must be at least 3 characters');
      process.exit(1);
    }
    console.log(`Hello, ${args.name}!`);
  });

// Command with custom error class
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

app.command('custom-error')
  .description('Command with custom error class')
  .argument('email', 'Email address')
  .action(async ({ args }) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new ValidationError('Invalid email format', 'email');
    }
    console.log(`Email is valid: ${args.email}`);
  });

app.run();
