/**
 * Color Output Example
 *
 * Demonstrates various color and styling options
 */

import { cli } from '../../src/index.js';
import { colors, color, rgbToAnsi } from '../../src/utils/index.js';

const app = cli('myapp')
  .version('1.0.0')
  .description('Color output example');

app.command('colors')
  .description('Show all available colors')
  .action(async () => {
    console.log('\n=== Foreground Colors ===\n');
    console.log(colors.black('Black text'));
    console.log(colors.red('Red text'));
    console.log(colors.green('Green text'));
    console.log(colors.yellow('Yellow text'));
    console.log(colors.blue('Blue text'));
    console.log(colors.magenta('Magenta text'));
    console.log(colors.cyan('Cyan text'));
    console.log(colors.white('White text'));
    console.log(colors.gray('Gray text'));

    console.log('\n=== Text Styles ===\n');
    console.log(colors.bold('Bold text'));
    console.log(colors.dim('Dim text'));
    console.log(colors.italic('Italic text'));
    console.log(colors.underline('Underlined text'));

    console.log('\n=== Background Colors ===\n');
    console.log(colors.bgWhite('White background'));
    console.log(colors.bgRed('Red background'));
    console.log(colors.bgGreen('Green background'));
    console.log(colors.bgBlue('Blue background'));

    console.log('\n=== Combinations ===\n');
    console.log(colors.bold.red('Bold red'));
    console.log(colors.underline.yellow('Underlined yellow'));
    console.log(colors.dim.cyan('Dim cyan'));
    console.log(colors.bgBlue.white('White on blue'));
    console.log(colors.bgGreen.black('Black on green'));
  });

app.command('rainbow')
  .description('Display rainbow text')
  .action(async () => {
    const text = 'Rainbow Text!';
    const rainbowColors = [
      colors.red,
      colors.yellow,
      colors.green,
      colors.cyan,
      colors.blue,
      colors.magenta,
    ];

    console.log('\n' + text.split('').map((char, i) => {
      return rainbowColors[i % rainbowColors.length](char);
    }).join('') + '\n');
  });

app.command('gradient')
  .description('Display gradient text')
  .argument('text', 'Text to display')
  .action(async ({ args }) => {
    const text = args.text || 'Gradient Text';
    const length = text.length;

    // Generate gradient from blue to cyan
    const gradient = text.split('').map((char, i) => {
      const ratio = i / length;
      const r = 59;
      const g = Math.floor(130 + ratio * 125);
      const b = 246;
      const ansiCode = rgbToAnsi(r, g, b);
      return `\x1b[${ansiCode}m${char}\x1b[0m`;
    }).join('');

    console.log('\n' + gradient + '\n');
  });

app.command('levels')
  .description('Show log levels with colors')
  .action(async () => {
    console.log('\n' + colors.dim('Timestamp') + ' ' + colors.gray('DEBUG') + ' Debug message');
    console.log(colors.dim('Timestamp') + ' ' + colors.green('INFO') + ' Info message');
    console.log(colors.dim('Timestamp') + ' ' + colors.yellow('WARN') + ' Warning message');
    console.log(colors.dim('Timestamp') + ' ' + colors.red('ERROR') + ' Error message');
    console.log('');
  });

app.command('box')
  .description('Draw a colored box')
  .action(async () => {
    const border = colors.bgCyan.black('  ');
    const inner = colors.bgBlue.black('  ');

    console.log('\n    ' + border.repeat(10));
    console.log('    ' + border + inner.repeat(8) + border);
    console.log('    ' + border + colors.bgBlue.white('  Box!  ') + border);
    console.log('    ' + border + inner.repeat(8) + border);
    console.log('    ' + border.repeat(10) + '\n');
  });

app.run();
