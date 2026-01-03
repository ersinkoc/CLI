/**
 * Middleware Chain Example
 *
 * Demonstrates how to use middleware to add pre/post processing to commands
 */

import { cli } from '../../src/index.js';
import { middlewarePlugin } from '../../src/plugins/optional/middleware/index.js';

const app = cli('myapp')
  .version('1.0.0')
  .description('Middleware example app')
  .use(middlewarePlugin())
  // Add global middleware
  .middleware(async (context, next) => {
    console.log('[Middleware 1] Before command');
    const start = Date.now();
    await next();
    console.log(`[Middleware 1] After command (${Date.now() - start}ms)`);
  })
  .middleware(async (context, next) => {
    console.log('[Middleware 2] Auth check');
    // Simulate auth check
    if (context.options?.['no-auth'] !== true) {
      context.user = { id: 1, name: 'user' };
    }
    await next();
  });

// Add command with specific middleware
app.command('build')
  .description('Build the project')
  .use(async (context, next) => {
    console.log('[Build Middleware] Validating build config...');
    await next();
  })
  .action(async ({ args, options }) => {
    console.log('Building...');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Build complete!');
  });

app.command('deploy')
  .description('Deploy to production')
  .option('--env', 'Environment to deploy to')
  .action(async ({ options }) => {
    console.log(`Deploying to ${options.env || 'production'}...`);
  });

app.run();
