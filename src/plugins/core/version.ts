import type { CLIPlugin, CLIKernel } from '../../types.js';
import { colors } from '../../utils/ansi.js';
import { VersionRequestedExit } from '../../errors/cli-error.js';

/**
 * Version plugin options
 */
export interface VersionPluginOptions {
  /** Custom version string */
  version?: string;
  /** Custom formatter */
  format?: (version: string) => string;
}

/**
 * Create version plugin
 *
 * @param options - Plugin options
 * @returns Version plugin
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { versionPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(versionPlugin());
 * ```
 */
export function versionPlugin(options: VersionPluginOptions = {}): CLIPlugin {
  return {
    name: 'version',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      // Listen for version event
      kernel.on('version', async (...args: unknown[]) => {
        const data = args[0] as { version: string };
        const version = options.version ?? data.version;
        const text = options.format
          ? options.format(version)
          : formatVersion(version);
        console.log(text);
      });

      // Listen for command:before to check for --version
      kernel.on('command:before', async (...args: unknown[]) => {
        const data = args[0] as any;
        const { context } = data;
        if (context.options?.version === true || context.options?.V === true) {
          await kernel.emit('version', { version: context.app.version });
          // Throw instead of process.exit to allow library users to handle gracefully
          throw new VersionRequestedExit();
        }
      });
    },
  };
}

/**
 * Default version formatter
 */
function formatVersion(version: string): string {
  return colors.cyan(`${version}`);
}
