/**
 * Custom Plugin Example
 *
 * Demonstrates how to create and register a custom plugin
 */

import { cli, type CLIPlugin, type CLIKernel } from '../../src/index.js';

// Custom logging plugin
interface LoggerConfig {
  prefix?: string;
  timestamp?: boolean;
}

function loggerPlugin(config: LoggerConfig = {}): CLIPlugin {
  const { prefix = '[APP]', timestamp = false } = config;

  return {
    name: 'logger',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      // Listen to all events
      kernel.on('command:before', async (...args: unknown[]) => {
        const data = args[0] as any;
        const time = timestamp ? new Date().toISOString() : '';
        console.log(`${prefix} ${time} Starting: ${data.context?.command}`);
      });

      kernel.on('command:after', async (...args: unknown[]) => {
        const data = args[0] as any;
        const time = timestamp ? new Date().toISOString() : '';
        console.log(`${prefix} ${time} Finished: ${data.context?.command}`);
      });

      kernel.on('error', async (...args: unknown[]) => {
        const data = args[0] as any;
        console.error(`${prefix} Error: ${data.error?.message || data}`);
      });
    },
  };
}

const app = cli('myapp')
  .version('1.0.0')
  .description('Custom plugin example')
  .use(loggerPlugin({ prefix: '[MYAPP]', timestamp: true }));

app.command('start')
  .description('Start the application')
  .action(async () => {
    console.log('Application started!');
    await new Promise(resolve => setTimeout(resolve, 100));
  });

app.command('fail')
  .description('Demonstrate error handling')
  .action(async () => {
    throw new Error('Something went wrong!');
  });

app.run();
