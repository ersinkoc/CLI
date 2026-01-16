/**
 * Color Plugin tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { colorPlugin, colors } from '../../src/plugins/optional/color/index.js';
import { CLIKernelImpl } from '../../src/kernel.js';

describe('Color Plugin', () => {
  let kernel: CLIKernelImpl;

  beforeEach(() => {
    kernel = new CLIKernelImpl();
  });

  it('should create color plugin', () => {
    const plugin = colorPlugin();
    expect(plugin.name).toBe('color');
    expect(plugin.version).toBe('2.0.0');
  });

  it('should add color utilities to context', async () => {
    colorPlugin().install(kernel);

    let receivedColor: any = null;
    kernel.on('command:before', async (data: any) => {
      receivedColor = data.context.color;
    });

    await kernel.emit('command:before', {
      context: {} as any,
    });

    expect(receivedColor).toBeDefined();
    expect(receivedColor.red).toBeInstanceOf(Function);
    expect(receivedColor.green).toBeInstanceOf(Function);
    expect(receivedColor.blue).toBeInstanceOf(Function);
  });

  it('should provide all color methods', async () => {
    colorPlugin().install(kernel);

    let receivedColor: any = null;
    kernel.on('command:before', async (data: any) => {
      receivedColor = data.context.color;
    });

    await kernel.emit('command:before', { context: {} as any });

    // Check basic colors
    expect(receivedColor.black).toBeInstanceOf(Function);
    expect(receivedColor.red).toBeInstanceOf(Function);
    expect(receivedColor.green).toBeInstanceOf(Function);
    expect(receivedColor.yellow).toBeInstanceOf(Function);
    expect(receivedColor.blue).toBeInstanceOf(Function);
    expect(receivedColor.magenta).toBeInstanceOf(Function);
    expect(receivedColor.cyan).toBeInstanceOf(Function);
    expect(receivedColor.white).toBeInstanceOf(Function);

    // Check gray (brightBlack)
    expect(receivedColor.gray).toBeInstanceOf(Function);

    // Check background colors
    expect(receivedColor.bgBlack).toBeInstanceOf(Function);
    expect(receivedColor.bgRed).toBeInstanceOf(Function);
    expect(receivedColor.bgGreen).toBeInstanceOf(Function);
    expect(receivedColor.bgYellow).toBeInstanceOf(Function);
    expect(receivedColor.bgBlue).toBeInstanceOf(Function);
    expect(receivedColor.bgMagenta).toBeInstanceOf(Function);
    expect(receivedColor.bgCyan).toBeInstanceOf(Function);
    expect(receivedColor.bgWhite).toBeInstanceOf(Function);

    // Check modifiers
    expect(receivedColor.bold).toBeInstanceOf(Function);
    expect(receivedColor.dim).toBeInstanceOf(Function);
    expect(receivedColor.italic).toBeInstanceOf(Function);
    expect(receivedColor.underline).toBeInstanceOf(Function);

    // Check custom colors
    expect(receivedColor.hex).toBeInstanceOf(Function);
    expect(receivedColor.rgb).toBeInstanceOf(Function);
  });

  it('should export colors utility', () => {
    expect(colors).toBeDefined();
    expect(colors.red).toBeInstanceOf(Function);
    expect(colors.green).toBeInstanceOf(Function);
  });

  it('should format text with colors', () => {
    const redText = colors.red('Error!');
    expect(redText).toContain('Error!');
    expect(typeof redText).toBe('string');
  });

  it('should compose color styles', () => {
    const boldText = colors.bold('Bold');
    const redBoldText = colors.red(colors.bold('Bold Red'));
    expect(boldText).toContain('Bold');
    expect(redBoldText).toContain('Bold Red');
    expect(typeof redBoldText).toBe('string');
  });
});
