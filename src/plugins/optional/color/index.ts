import type { CLIPlugin, CLIKernel, Pigment } from '../../../types.js';
import { colors as colorFn } from '../../../utils/ansi.js';
import { createPigment } from '../../../utils/pigment.js';

/**
 * Color plugin
 * Provides colored output utilities via the built-in zero-dependency
 * chainable color API (pigment-compatible).
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { colorPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(colorPlugin());
 *
 * app.command('test').action(({ color, pigment, chalk }) => {
 *   // Legacy flat API (always available)
 *   console.log(color.red('Error!'));
 *   console.log(color.green('Success!'));
 *
 *   // Chainable pigment API (always available, zero-dependency)
 *   console.log(pigment.red.bold('Error!'));
 *   console.log(pigment.green.italic('Success!'));
 *   console.log(pigment.hex('#ff6600').bold('Custom color!'));
 *
 *   // chalk is an alias of pigment
 *   console.log(chalk.blue('Info'));
 * });
 * ```
 */
export function colorPlugin(): CLIPlugin {
  return {
    name: 'color',
    version: '2.0.0',

    install(kernel: CLIKernel) {
      // Add color utilities to action context
      kernel.on('command:before', async (data: unknown) => {
        const ctx = data as { context: Record<string, unknown> };
        // Legacy API for backward compatibility (always available)
        ctx.context.color = colorFn;

        // Chainable pigment-compatible API (always available, zero-dependency)
        const pigment = createPigment();
        ctx.context.pigment = pigment;
        ctx.context.chalk = pigment;
      });
    },
  };
}

/**
 * Get a Pigment instance.
 * Preserves the historical async contract (`await getPigment()`).
 * The built-in implementation is always available, so this never
 * resolves to null.
 */
export async function getPigment(options?: import('../../../types.js').PigmentOptions): Promise<Pigment> {
  return createPigment(options);
}

/**
 * Create a new Pigment instance (built-in, zero-dependency)
 */
export { createPigment };
export type { Pigment, PigmentOptions, Styler, ColorSupport } from '../../../types.js';

// Re-export color utilities (legacy)
export { colors } from '../../../utils/ansi.js';
export type { ColorUtils } from '../../../types.js';
