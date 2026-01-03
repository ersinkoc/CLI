/**
 * Progress Bar Example
 *
 * Demonstrates creating a progress bar without external dependencies
 */

import { cli } from '../../src/index.js';

class ProgressBar {
  private width: number;
  private complete: string;
  private incomplete: string;

  constructor(total: number, width = 40) {
    this.width = width;
    this.complete = '\x1b[32m=\x1b[0m';
    this.incomplete = '\x1b[90m-\x1b[0m';
  }

  render(current: number, total: number, message = '') {
    const percent = Math.min(1, current / total);
    const complete = Math.floor(this.width * percent);
    const incomplete = this.width - complete;

    const bar = this.complete.repeat(complete) + this.incomplete.repeat(incomplete);
    const pct = Math.floor(percent * 100);

    // Clear line and render
    process.stdout.write('\r\x1b[K');
    process.stdout.write(`[${bar}] ${pct}% ${message}`);

    if (current >= total) {
      process.stdout.write('\n');
    }
  }
}

async function simulateProgress() {
  const bar = new ProgressBar(100);
  const total = 100;

  for (let i = 0; i <= total; i++) {
    bar.render(i, total, 'Processing...');
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}

async function simulateSteps() {
  const steps = [
    'Initializing...',
    'Loading assets...',
    'Compiling...',
    'Optimizing...',
    'Writing output...',
    'Done!',
  ];

  const bar = new ProgressBar(steps.length);

  for (let i = 0; i < steps.length; i++) {
    bar.render(i + 1, steps.length, steps[i]);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

const app = cli('myapp')
  .version('1.0.0')
  .description('Progress bar example');

app.command('progress')
  .description('Show a simple progress bar')
  .action(async () => {
    await simulateProgress();
  });

app.command('steps')
  .description('Show progress with step labels')
  .action(async () => {
    await simulateSteps();
  });

app.command('multiple')
  .description('Show multiple progress bars')
  .action(async () => {
    console.log('Processing multiple files:\n');

    const files = ['file1.txt', 'file2.txt', 'file3.txt'];
    const bars = files.map((_, i) => new ProgressBar(100));

    for (let i = 0; i <= 100; i++) {
      files.forEach((file, idx) => {
        bars[idx].render(i, 100, file);
        if (idx < files.length - 1) process.stdout.write('\n');
      });

      // Move cursor up to redraw
      if (i < 100) {
        process.stdout.write(`\x1b[${files.length}F`);
      }

      await new Promise(resolve => setTimeout(resolve, 30));
    }

    console.log('\nAll files processed!');
  });

app.run();
