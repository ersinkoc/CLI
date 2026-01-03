/**
 * Structured Logging Example
 *
 * Demonstrates advanced logging patterns
 */

import { cli } from '../../src/index.js';

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(level: LogLevel = LogLevel.INFO, prefix = '') {
    this.level = level;
    this.prefix = prefix;
  }

  private log(level: LogLevel, color: string, label: string, message: string, meta?: Record<string, unknown>) {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`${this.prefix}[${timestamp}] ${color}${label}\x1b[0m ${message}${metaStr}`);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, '\x1b[36m', 'DEBUG', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.INFO, '\x1b[32m', 'INFO', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.WARN, '\x1b[33m', 'WARN', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, '\x1b[31m', 'ERROR', message, meta);
  }
}

const logger = new Logger(LogLevel.INFO, '[MYAPP] ');

const app = cli('myapp')
  .version('1.0.0')
  .description('Structured logging example')
  .option('-v, --verbose', 'Enable verbose (debug) logging')
  .option('-q, --quiet', 'Suppress info logs');

app.command('start')
  .description('Start the application')
  .action(async ({ options }) => {
    if (options.verbose) {
      logger.level = LogLevel.DEBUG;
    }
    if (options.quiet) {
      logger.level = LogLevel.WARN;
    }

    logger.debug('Starting with debug mode');
    logger.info('Application starting', { port: 3000 });

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      logger.info('Application started successfully');
    } catch (error) {
      logger.error('Failed to start', { error: error instanceof Error ? error.message : error });
      process.exit(1);
    }
  });

app.command('process')
  .description('Process some data')
  .argument('input', 'Input file')
  .action(async ({ args }) => {
    logger.info('Processing file', { file: args.input });

    logger.debug('Reading file...');
    await new Promise(resolve => setTimeout(resolve, 50));

    logger.debug('Parsing data...');
    await new Promise(resolve => setTimeout(resolve, 50));

    logger.warn('Found some potential issues', { warnings: 3 });

    logger.info('Processing complete', { records: 100 });
  });

app.run();
