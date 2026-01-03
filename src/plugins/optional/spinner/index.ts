import type { CLIPlugin, CLIKernel, Spinner, SpinnerUtils } from '../../../types.js';
import { colors } from '../../../utils/ansi.js';

/**
 * Spinner frames
 */
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SPINNER_SUCCESS = '✔';
const SPINNER_FAIL = '✖';
const SPINNER_WARN = '⚠';
const SPINNER_INFO = 'ℹ';

/**
 * Spinner implementation
 */
class SpinnerImpl implements Spinner {
  private interval?: NodeJS.Timeout;
  private frameIndex = 0;
  private _text = '';
  private readonly isTTY: boolean;

  constructor(private readonly kernel: CLIKernel) {
    this.isTTY = process.stdout.isTTY === true;
  }

  /** Current spinner text */
  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
    if (this.isTTY) {
      this.render();
    }
  }

  /** Update spinner text */
  update(text: string): void {
    this.text = text;
  }

  /** Start the spinner */
  start(text: string): this {
    this._text = text;

    if (!this.isTTY) {
      // Fallback for non-TTY
      process.stdout.write(`${text}...\n`);
      return this;
    }

    // Start animation
    this.interval = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % SPINNER_FRAMES.length;
      this.render();
    }, 80);

    return this;
  }

  /** Mark as succeeded */
  succeed(text?: string): void {
    this.stop(SPINNER_SUCCESS, text ?? this.text, colors.green);
  }

  /** Mark as failed */
  fail(text?: string): void {
    this.stop(SPINNER_FAIL, text ?? this.text, colors.red);
  }

  /** Mark with warning */
  warn(text?: string): void {
    this.stop(SPINNER_WARN, text ?? this.text, colors.yellow);
  }

  /** Mark with info */
  info(text?: string): void {
    this.stop(SPINNER_INFO, text ?? this.text, colors.cyan);
  }

  /** Stop the spinner */
  private stop(symbol: string, text: string, colorFn: (s: string) => string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }

    if (this.isTTY) {
      // Clear current line and show final message
      process.stdout.write('\r');
      console.log(`${colorFn(symbol)} ${text}`);
    } else {
      console.log(`${symbol} ${text}`);
    }
  }

  /** Render current frame */
  private render(): void {
    const frame = SPINNER_FRAMES[this.frameIndex];
    process.stdout.write(`\r${frame} ${this._text}`);
  }
}

/**
 * Spinner plugin
 * Provides loading spinners
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { spinnerPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(spinnerPlugin());
 *
 * app.command('deploy').action(async ({ spinner }) => {
 *   const spin = spinner.start('Deploying...');
 *   await deploy();
 *   spin.succeed('Deployed!');
 * });
 * ```
 */
export function spinnerPlugin(): CLIPlugin {
  return {
    name: 'spinner',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      // Add spinner utilities to action context
      kernel.on('command:before', async (data: any) => {
        const spinnerUtils: SpinnerUtils = {
          start: (text: string) => new SpinnerImpl(kernel).start(text),
        };
        data.context.spinner = spinnerUtils;
      });
    },
  };
}
