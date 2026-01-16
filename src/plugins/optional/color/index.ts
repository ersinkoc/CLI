import type { CLIPlugin, CLIKernel, Pigment } from '../../../types.js';
import { colors as colorFn } from '../../../utils/ansi.js';

// Lazy-loaded @oxog/pigment instance (optional)
let pigmentInstance: Pigment | null | undefined = undefined;
let pigmentModule: typeof import('@oxog/pigment') | null = null;

/**
 * Lazily load and create pigment instance
 * Returns null if @oxog/pigment is not available
 */
async function getPigment(): Promise<Pigment | null> {
  if (pigmentInstance !== undefined) {
    return pigmentInstance;
  }

  try {
    pigmentModule = await import('@oxog/pigment');
    pigmentInstance = pigmentModule.createPigment();
    return pigmentInstance;
  } catch {
    // @oxog/pigment not available
    pigmentInstance = null;
    return null;
  }
}

/**
 * Color plugin
 * Provides colored output utilities powered by @oxog/pigment (if available)
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { colorPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(colorPlugin());
 *
 * app.command('test').action(({ color, pigment }) => {
 *   // Legacy API (always available)
 *   console.log(color.red('Error!'));
 *   console.log(color.green('Success!'));
 *
 *   // @oxog/pigment chainable API (if available)
 *   if (pigment) {
 *     console.log(pigment.red.bold('Error!'));
 *     console.log(pigment.green.italic('Success!'));
 *     console.log(pigment.hex('#ff6600').bold('Custom color!'));
 *   }
 * });
 * ```
 */
export function colorPlugin(): CLIPlugin {
  return {
    name: 'color',
    version: '2.0.0',

    install(kernel: CLIKernel) {
      // Add color utilities to action context
      kernel.on('command:before', async (data: any) => {
        // Legacy API for backward compatibility (always available)
        data.context.color = colorFn;

        // New @oxog/pigment API (if available)
        const pigment = await getPigment();
        if (pigment) {
          data.context.pigment = pigment;
          data.context.chalk = pigment;
        }
      });
    },
  };
}

/**
 * Get the Pigment instance (lazy-loaded)
 * Returns null if @oxog/pigment is not installed
 */
export { getPigment };

/**
 * Create a new Pigment instance
 * Returns null if @oxog/pigment is not installed
 */
export async function createPigment(
  options?: import('@oxog/pigment').PigmentOptions
): Promise<Pigment | null> {
  try {
    const mod = pigmentModule || (await import('@oxog/pigment'));
    return mod.createPigment(options);
  } catch {
    return null;
  }
}

// Re-export color utilities (legacy)
export { colors } from '../../../utils/ansi.js';
export type { ColorUtils } from '../../../types.js';

// Re-export types from @oxog/pigment (these are always available as type-only)
export type { Pigment, PigmentOptions, Styler, ColorSupport } from '../../../types.js';
