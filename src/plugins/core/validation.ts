import type { CLIPlugin, CLIKernel } from '../../types.js';
import { ValidationError } from '../../errors/cli-error.js';
import { colors } from '../../utils/ansi.js';

/**
 * Validation plugin
 * Validates command arguments and options
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { validationPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(validationPlugin());
 * ```
 */
export function validationPlugin(): CLIPlugin {
  return {
    name: 'validation',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      // Listen for command:before to validate
      kernel.on('command:before', async (data: any) => {
        const { command, context } = data;
        const errors: string[] = [];

        // Validate arguments
        for (const arg of command.arguments) {
          const value = context.args[arg.name];

          // Check required
          if (arg.required && (value === undefined || value === null || value === '')) {
            errors.push(`Missing required argument: ${colors.yellow(arg.name)}`);
            continue;
          }

          // Custom validation
          if (arg.validate && value !== undefined) {
            const result = arg.validate(value);
            if (result !== true) {
              errors.push(`Argument ${colors.yellow(arg.name)}: ${result}`);
            }
          }
        }

        // Validate options
        for (const opt of command.options) {
          const value = context.options[opt.name];

          // Check required
          if (opt.required && (value === undefined || value === null || value === '')) {
            errors.push(`Missing required option: ${colors.yellow(`--${opt.name}`)}`);
            continue;
          }

          // Check choices
          if (opt.choices && opt.choices.length > 0 && value !== undefined) {
            const values = Array.isArray(value) ? value : [value];
            for (const v of values) {
              if (!opt.choices!.includes(v)) {
                errors.push(
                  `Option ${colors.yellow(`--${opt.name}`)} must be one of: ${opt.choices.join(', ')}`
                );
              }
            }
          }

          // Custom validation
          if (opt.validate && value !== undefined) {
            const result = opt.validate(value);
            if (result !== true) {
              errors.push(`Option ${colors.yellow(`--${opt.name}`)}: ${result}`);
            }
          }
        }

        // Throw if errors
        if (errors.length > 0) {
          throw new ValidationError(errors.join('\n'));
        }
      });
    },
  };
}
