import type { CLIPlugin, CLIKernel, Middleware } from '../../../types.js';

/**
 * Interface for CLI apps that support middleware plugin integration.
 * @internal
 */
interface MiddlewareCapableCLI {
  _pendingMiddleware?: Middleware[];
  _addGlobalMiddleware?: (mw: Middleware) => void;
  _middlewarePluginActive: boolean;
}

/**
 * Middleware plugin
 * Adds command middleware support
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { middlewarePlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(middlewarePlugin());
 *
 * // Add global middleware
 * app.middleware(async (ctx, next) => {
 *   console.log('Before:', ctx.command.name);
 *   await next();
 *   console.log('After:', ctx.command.name);
 * });
 *
 * // Add command-specific middleware
 * app.command('deploy')
 *   .use(authMiddleware)
 *   .action(() => { ... });
 * ```
 */
export function middlewarePlugin(): CLIPlugin {
  // Track global middleware at plugin level
  const globalMiddleware: Middleware[] = [];

  return {
    name: 'middleware',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      // Listen for command:before to execute global and command-specific middleware
      kernel.on('command:before', async (data: unknown) => {
        const { command, context } = data as { command: { middleware?: Middleware[] }; context: unknown };

        // Combine global and command-specific middleware
        const allMiddleware = [...globalMiddleware, ...(command.middleware || [])];

        if (allMiddleware.length === 0) {
          return;
        }

        // Execute middleware chain
        let index = 0;
        const next = async () => {
          if (index < allMiddleware.length) {
            const mw = allMiddleware[index++];
            await mw(context as Parameters<Middleware>[0], next);
          }
        };

        await next();
      });
    },

    onInit(context: unknown) {
      const ctx = context as { app?: MiddlewareCapableCLI };
      // Add use method to CLI and process any pending middleware
      if (ctx.app) {
        const app = ctx.app;

        // Move any pending middleware to global middleware
        if (Array.isArray(app._pendingMiddleware)) {
          globalMiddleware.push(...app._pendingMiddleware);
        }

        // Set up _addGlobalMiddleware for future middleware additions
        app._addGlobalMiddleware = (middleware: Middleware) => {
          globalMiddleware.push(middleware);
        };

        // Set flag to indicate middleware plugin is handling all middleware
        app._middlewarePluginActive = true;
      }
    },
  };
}

/**
 * Create authentication middleware
 *
 * @param getToken - Function to get auth token from context
 * @returns Authentication middleware
 *
 * @example
 * ```typescript
 * const auth = requireAuth((ctx) => ctx.options.token);
 * app.command('deploy').use(auth);
 * ```
 */
export function requireAuth(
  getToken: (ctx: any) => string | undefined
): Middleware {
  return async (ctx, next) => {
    const token = getToken(ctx);
    if (!token) {
      throw new Error('Authentication required');
    }
    await next();
  };
}
