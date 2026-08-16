/**
 * Object Config API
 *
 * Define an entire CLI application declaratively with a nested config
 * object instead of chaining builder calls. This module re-exports the
 * root `cli()` factory with config-object types surfaced explicitly.
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli/config';
 *
 * const app = cli({
 *   name: 'myapp',
 *   version: '1.0.0',
 *   description: 'My awesome CLI',
 *   commands: {
 *     init: {
 *       description: 'Initialize a new project',
 *       arguments: {
 *         name: { type: 'string', required: true, description: 'Project name' },
 *       },
 *       options: {
 *         template: { type: 'string', alias: 't', default: 'default' },
 *       },
 *       action: async (ctx) => {
 *         console.log(`Initializing ${ctx.args.name} with ${ctx.options.template}`);
 *       },
 *     },
 *   },
 * });
 *
 * app.run();
 * ```
 */

export { cli } from '../cli.js';
export type { CLIOptions as ConfigCLIOptions } from '../types.js';
