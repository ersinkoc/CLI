/**
 * Config File Example
 *
 * Demonstrates loading configuration from a file
 */

import { cli } from '../../src/index.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

interface AppConfig {
  port?: number;
  host?: string;
  debug?: boolean;
  output?: string;
}

// Simple config loader
function loadConfig(configPath: string): AppConfig {
  try {
    const content = readFileSync(resolve(configPath), 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

const app = cli('myapp')
  .version('1.0.0')
  .description('Config file example')
  .option('-c, --config <path>', 'Path to config file', './config.json')
  .option('--port <number>', 'Server port')
  .option('--host <address>', 'Server host')
  .option('-d, --debug', 'Enable debug mode');

app.command('start')
  .description('Start the server with config')
  .action(async ({ options }) => {
    // Load config from file
    const fileConfig = loadConfig(options.config || './config.json');

    // Merge config: defaults < file config < CLI options
    const config: AppConfig = {
      port: 3000,
      host: 'localhost',
      debug: false,
      output: 'dist',
      ...fileConfig,
      ...options,
    };

    console.log('Starting server with config:');
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  Debug: ${config.debug}`);
    console.log(`  Output: ${config.output}`);

    // Simulate server start
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Server started!');
  });

app.command('config')
  .description('Show current configuration')
  .option('-c, --config <path>', 'Path to config file', './config.json')
  .action(async ({ options }) => {
    const fileConfig = loadConfig(options.config);
    console.log('Configuration:');
    console.log(JSON.stringify(fileConfig, null, 2));
  });

app.run();
