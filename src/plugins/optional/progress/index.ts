import type { CLIPlugin, CLIKernel } from '../../../types.js';
import { colors } from '../../../utils/ansi.js';
import { getTerminalWidth } from '../../../utils/terminal.js';

/**
 * Progress bar options
 */
export interface ProgressBarOptions {
  /** Total value */
  total: number;
  /** Initial value */
  current?: number;
  /** Bar width (characters) */
  width?: number;
  /** Completed character */
  completeChar?: string;
  /** Incomplete character */
  incompleteChar?: string;
  /** Show percentage */
  showPercentage?: boolean;
  /** Show ETA */
  showETA?: boolean;
  /** Show rate (items/sec) */
  showRate?: boolean;
  /** Custom format string */
  format?: string;
  /** Clear on complete */
  clearOnComplete?: boolean;
  /** Hide cursor while active */
  hideCursor?: boolean;
}

/**
 * Progress bar instance
 */
export interface ProgressBar {
  /** Current value */
  current: number;
  /** Total value */
  total: number;
  /** Update progress */
  update(value: number): void;
  /** Increment progress */
  increment(delta?: number): void;
  /** Set total */
  setTotal(total: number): void;
  /** Stop the progress bar */
  stop(): void;
  /** Mark as complete */
  complete(): void;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}

/**
 * Format time duration
 */
function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Progress bar implementation
 */
class ProgressBarImpl implements ProgressBar {
  current: number;
  total: number;

  private options: Required<ProgressBarOptions>;
  private startTime: number;
  private lastRenderTime: number;
  private isActive: boolean;
  private isTTY: boolean;

  constructor(options: ProgressBarOptions) {
    this.total = options.total;
    this.current = options.current ?? 0;
    this.startTime = Date.now();
    this.lastRenderTime = 0;
    this.isActive = true;
    this.isTTY = process.stdout.isTTY === true;

    this.options = {
      total: options.total,
      current: options.current ?? 0,
      width: options.width ?? 40,
      completeChar: options.completeChar ?? '█',
      incompleteChar: options.incompleteChar ?? '░',
      showPercentage: options.showPercentage ?? true,
      showETA: options.showETA ?? true,
      showRate: options.showRate ?? false,
      format: options.format ?? ':bar :percent :eta',
      clearOnComplete: options.clearOnComplete ?? false,
      hideCursor: options.hideCursor ?? true,
    };

    if (this.isTTY && this.options.hideCursor) {
      process.stdout.write('\x1b[?25l'); // Hide cursor
    }

    this.render();
  }

  update(value: number): void {
    this.current = Math.min(value, this.total);
    this.render();

    if (this.current >= this.total) {
      this.complete();
    }
  }

  increment(delta = 1): void {
    this.update(this.current + delta);
  }

  setTotal(total: number): void {
    this.total = total;
    this.render();
  }

  stop(): void {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.isTTY) {
      if (this.options.hideCursor) {
        process.stdout.write('\x1b[?25h'); // Show cursor
      }
      process.stdout.write('\n');
    }
  }

  complete(): void {
    if (!this.isActive) return;

    this.current = this.total;
    this.render();

    if (this.isTTY) {
      if (this.options.clearOnComplete) {
        process.stdout.write('\r\x1b[2K');
      } else {
        process.stdout.write('\n');
      }
      if (this.options.hideCursor) {
        process.stdout.write('\x1b[?25h'); // Show cursor
      }
    }

    this.isActive = false;
  }

  private render(): void {
    if (!this.isActive) return;

    // Throttle rendering to ~60fps
    const now = Date.now();
    if (now - this.lastRenderTime < 16 && this.current < this.total) {
      return;
    }
    this.lastRenderTime = now;

    const percent = this.total > 0 ? this.current / this.total : 0;
    const elapsed = (now - this.startTime) / 1000;
    const rate = elapsed > 0 ? this.current / elapsed : 0;
    const eta = rate > 0 ? (this.total - this.current) / rate : 0;

    // Build progress bar
    const barWidth = Math.min(this.options.width, getTerminalWidth() - 30);
    const completeWidth = Math.round(barWidth * percent);
    const incompleteWidth = barWidth - completeWidth;

    const bar =
      colors.green(this.options.completeChar.repeat(completeWidth)) +
      colors.gray(this.options.incompleteChar.repeat(incompleteWidth));

    // Format output
    let output = this.options.format
      .replace(':bar', bar)
      .replace(':current', String(this.current))
      .replace(':total', String(this.total))
      .replace(':percent', `${(percent * 100).toFixed(0)}%`)
      .replace(':elapsed', formatTime(elapsed))
      .replace(':eta', eta > 0 && eta < Infinity ? formatTime(eta) : '--')
      .replace(':rate', `${rate.toFixed(1)}/s`)
      .replace(':bytes', formatBytes(this.current))
      .replace(':totalBytes', formatBytes(this.total));

    if (this.isTTY) {
      process.stdout.write('\r\x1b[2K' + output);
    }
  }
}

/**
 * Multi-progress bar for tracking multiple tasks
 */
export interface MultiProgressBar {
  /** Create a new progress bar */
  create(options: ProgressBarOptions): ProgressBar;
  /** Remove a progress bar */
  remove(bar: ProgressBar): void;
  /** Stop all progress bars */
  stop(): void;
}

/**
 * Multi-progress implementation
 */
class MultiProgressImpl implements MultiProgressBar {
  private bars: ProgressBarImpl[] = [];
  private isActive = true;
  private interval?: NodeJS.Timeout;

  constructor() {
    // Start render loop
    if (process.stdout.isTTY) {
      process.stdout.write('\x1b[?25l'); // Hide cursor
    }
  }

  create(options: ProgressBarOptions): ProgressBar {
    const bar = new ProgressBarImpl({ ...options, hideCursor: false });
    this.bars.push(bar);
    return bar;
  }

  remove(bar: ProgressBar): void {
    const index = this.bars.indexOf(bar as ProgressBarImpl);
    if (index >= 0) {
      this.bars.splice(index, 1);
    }
  }

  stop(): void {
    if (!this.isActive) return;
    this.isActive = false;

    for (const bar of this.bars) {
      bar.stop();
    }

    if (this.interval) {
      clearInterval(this.interval);
    }

    if (process.stdout.isTTY) {
      process.stdout.write('\x1b[?25h'); // Show cursor
    }
  }
}

/**
 * Progress utilities interface
 */
export interface ProgressUtils {
  /** Create a single progress bar */
  create(options: ProgressBarOptions): ProgressBar;
  /** Create a multi-progress bar manager */
  multi(): MultiProgressBar;
}

/**
 * Progress plugin
 * Provides progress bar utilities
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { progressPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(progressPlugin());
 *
 * app.command('download').action(async ({ progress }) => {
 *   const bar = progress.create({ total: 100 });
 *
 *   for (let i = 0; i <= 100; i++) {
 *     await delay(50);
 *     bar.update(i);
 *   }
 * });
 * ```
 */
export function progressPlugin(): CLIPlugin {
  return {
    name: 'progress',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      kernel.on('command:before', async (data: any) => {
        const progressUtils: ProgressUtils = {
          create: (options: ProgressBarOptions) => new ProgressBarImpl(options),
          multi: () => new MultiProgressImpl(),
        };

        data.context.progress = progressUtils;
      });
    },
  };
}
