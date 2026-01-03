import type { CLIPlugin, CLIKernel, LoggerUtils } from '../../../types.js';
import { colors } from '../../../utils/ansi.js';

/**
 * Logger plugin options
 */
export interface LoggerPluginOptions {
  /** Minimum log level */
  level?: 'debug' | 'info' | 'warn' | 'error';
  /** Show timestamps */
  timestamp?: boolean;
}

/**
 * Get log level priority
 */
function getLevelPriority(level: string): number {
  const priorities: Record<string, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };
  return priorities[level] ?? 1;
}

/**
 * Logger plugin
 * Provides leveled logging
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { loggerPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(loggerPlugin({ level: 'info' }));
 *
 * app.command('run').action(({ logger }) => {
 *   logger.debug('Debug info');
 *   logger.info('Info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message');
 * });
 * ```
 */
export function loggerPlugin(options: LoggerPluginOptions = {}): CLIPlugin {
  const { level = 'info', timestamp = false } = options;
  const minPriority = getLevelPriority(level);

  return {
    name: 'logger',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      // Add logger utilities to action context
      kernel.on('command:before', async (data: any) => {
        const shouldLog = (msgLevel: string) => {
          // Check global verbose flag
          if (data.context.options?.verbose) return true;
          return getLevelPriority(msgLevel) >= minPriority;
        };

        const formatMessage = (
          level: string,
          message: string,
          colorFn: (s: string) => string
        ): string => {
          const parts: string[] = [];

          if (timestamp) {
            const now = new Date();
            parts.push(colors.gray(`[${now.toISOString()}]`));
          }

          parts.push(colorFn(`[${level.toUpperCase()}]`));
          parts.push(message);

          return parts.join(' ');
        };

        const loggerUtils: LoggerUtils = {
          debug: (message: string, ...args: unknown[]) => {
            if (shouldLog('debug')) {
              console.log(formatMessage('debug', message, colors.gray), ...args);
            }
          },

          info: (message: string, ...args: unknown[]) => {
            if (shouldLog('info')) {
              console.log(formatMessage('info', message, colors.cyan), ...args);
            }
          },

          warn: (message: string, ...args: unknown[]) => {
            if (shouldLog('warn')) {
              console.warn(formatMessage('warn', message, colors.yellow), ...args);
            }
          },

          error: (message: string, ...args: unknown[]) => {
            if (shouldLog('error')) {
              console.error(formatMessage('error', message, colors.red), ...args);
            }
          },
        };

        data.context.logger = loggerUtils;
      });
    },
  };
}
