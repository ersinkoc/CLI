import type { CLIPlugin, CLIKernel } from '../../../types.js';
import { colors as colorFn } from '../../../utils/ansi.js';

/**
 * Color plugin
 * Provides colored output utilities
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { colorPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(colorPlugin());
 *
 * app.command('test').action(({ color }) => {
 *   console.log(color.red('Error!'));
 *   console.log(color.green.bold('Success!'));
 * });
 * ```
 */
export function colorPlugin(): CLIPlugin {
  return {
    name: 'color',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      // Add color utilities to action context
      kernel.on('command:before', async (data: any) => {
        data.context.color = colorFn;
      });
    },
  };
}

// Re-export color utilities
export { colors } from '../../../utils/ansi.js';
export type { ColorUtils } from '../../../utils/ansi.js';
