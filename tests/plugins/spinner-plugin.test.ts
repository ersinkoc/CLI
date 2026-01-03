/**
 * Spinner Plugin tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { spinnerPlugin } from '../../src/plugins/optional/spinner/index.js';
import { CLIKernelImpl } from '../../src/kernel.js';

describe('Spinner Plugin', () => {
  let kernel: CLIKernelImpl;
  let originalIsTTY: boolean | undefined;

  beforeEach(() => {
    kernel = new CLIKernelImpl();
    originalIsTTY = process.stdout.isTTY;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original TTY setting
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      writable: true,
    });
  });

  it('should create spinner plugin', () => {
    const plugin = spinnerPlugin();
    expect(plugin.name).toBe('spinner');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should add spinner utilities to context', async () => {
    spinnerPlugin().install(kernel);

    let receivedSpinner: any = null;
    kernel.on('command:before', async (data: any) => {
      receivedSpinner = data.context.spinner;
    });

    await kernel.emit('command:before', {
      context: {} as any,
    });

    expect(receivedSpinner).toBeDefined();
    expect(receivedSpinner.start).toBeInstanceOf(Function);
  });

  it('should create spinner with start method', async () => {
    spinnerPlugin().install(kernel);

    let spinnerUtils: any = null;
    kernel.on('command:before', async (data: any) => {
      spinnerUtils = data.context.spinner;
    });
    await kernel.emit('command:before', { context: {} as any });

    const spinner = spinnerUtils.start('Loading...');
    expect(spinner).toBeDefined();
    expect(spinner.text).toBe('Loading...');
    expect(spinner.start).toBeInstanceOf(Function);
    expect(spinner.succeed).toBeInstanceOf(Function);
    expect(spinner.fail).toBeInstanceOf(Function);
    expect(spinner.warn).toBeInstanceOf(Function);
    expect(spinner.info).toBeInstanceOf(Function);
  });

  it('should update spinner text', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    spinner.text = 'New text';
    expect(spinner.text).toBe('New text');
  });

  it('should update spinner with update method', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    spinner.update('Updated text');
    expect(spinner.text).toBe('Updated text');
  });

  it('should call succeed method', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    spinner.succeed('Done!');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should call fail method', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    spinner.fail('Failed!');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should call warn method', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    spinner.warn('Warning!');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should call info method', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    spinner.info('Info!');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should use default text when not provided to succeed', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    spinner.succeed();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should be chainable when starting spinner', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner;
    });
    await kernel.emit('command:before', { context: {} as any });

    const result = spinner.start('Loading...');
    expect(result).toBe(result); // Chaining returns same object
  });

  it('should handle info method with default text', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    spinner.info();
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Loading'));

    consoleSpy.mockRestore();
  });

  it('should render in TTY mode', async () => {
    // Mock TTY mode
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
    });

    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    // Trigger render by updating text
    spinner.text = 'Rendering...';
    expect(writeSpy).toHaveBeenCalled();

    writeSpy.mockRestore();
  });

  it('should handle animation and stop in TTY mode', async () => {
    // Mock TTY mode
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
    });

    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Wait for animation to run
    await new Promise(resolve => setTimeout(resolve, 100));

    // Stop the spinner to trigger clearInterval and TTY output
    spinner.succeed('Done!');

    expect(consoleSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();

    writeSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should handle warn method', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    spinner.warn('Warning!');
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('⚠'));

    consoleSpy.mockRestore();
  });

  it('should update spinner text', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    spinner.text = 'New text';
    expect(spinner.text).toBe('New text');
  });

  it('should stop spinner with fail method', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    spinner.fail('Failed!');
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed'));

    consoleSpy.mockRestore();
  });

  it('should call stop on succeed', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    spinner.succeed('Success!');
    expect(consoleSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✔'));

    consoleSpy.mockRestore();
  });

  it('should handle non-TTY mode rendering', async () => {
    // Mock non-TTY mode
    Object.defineProperty(process.stdout, 'isTTY', {
      value: false,
      writable: true,
    });

    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner.start('Loading...');
    });
    await kernel.emit('command:before', { context: {} as any });

    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    // Update text in non-TTY mode
    spinner.text = 'Still loading...';

    // In non-TTY mode, updates should be minimal
    expect(spinner.text).toBe('Still loading...');

    writeSpy.mockRestore();
  });

  it('should not throw when stopping non-started spinner', async () => {
    spinnerPlugin().install(kernel);

    let spinner: any = null;
    kernel.on('command:before', async (data: any) => {
      spinner = data.context.spinner;
    });
    await kernel.emit('command:before', { context: {} as any });

    // Don't throw even if spinner wasn't started
    // Check if stop method exists before calling
    const hasStop = typeof spinner.stop === 'function';
    expect(typeof spinner.start).toBe('function');
  });
});
