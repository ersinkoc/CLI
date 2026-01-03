/**
 * Logger Plugin tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loggerPlugin } from '../../src/plugins/optional/logger/index.js';
import { CLIKernelImpl } from '../../src/kernel.js';

describe('Logger Plugin', () => {
  let kernel: CLIKernelImpl;

  beforeEach(() => {
    kernel = new CLIKernelImpl();
    vi.clearAllMocks();
  });

  it('should create logger plugin with defaults', () => {
    const plugin = loggerPlugin();
    expect(plugin.name).toBe('logger');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should create logger plugin with options', () => {
    const plugin = loggerPlugin({ level: 'debug', timestamp: true });
    expect(plugin.name).toBe('logger');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should add logger utilities to context', async () => {
    const plugin = loggerPlugin();
    plugin.install(kernel);

    let receivedLogger: any = null;
    kernel.on('command:before', async (data: any) => {
      receivedLogger = data.context.logger;
    });

    await kernel.emit('command:before', {
      context: { options: {} } as any,
    });

    expect(receivedLogger).toBeDefined();
    expect(receivedLogger.debug).toBeInstanceOf(Function);
    expect(receivedLogger.info).toBeInstanceOf(Function);
    expect(receivedLogger.warn).toBeInstanceOf(Function);
    expect(receivedLogger.error).toBeInstanceOf(Function);
  });

  it('should respect log level - debug', async () => {
    const plugin = loggerPlugin({ level: 'debug' });
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await kernel.emit('command:before', {
      context: { options: {} } as any,
    });

    // Get the logger that was added to context
    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.debug('Debug message');
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('should respect log level - info', async () => {
    const plugin = loggerPlugin({ level: 'info' });
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.info('Info message');
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('should respect log level - warn', async () => {
    const plugin = loggerPlugin({ level: 'warn' });
    plugin.install(kernel);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.warn('Warning message');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('should respect log level - error', async () => {
    const plugin = loggerPlugin({ level: 'error' });
    plugin.install(kernel);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.error('Error message');
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('should filter debug messages when level is info', async () => {
    const plugin = loggerPlugin({ level: 'info' });
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.debug('Debug message');
    expect(logSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('should add timestamps when enabled', async () => {
    const plugin = loggerPlugin({ timestamp: true });
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.info('Info message');

    const callArgs = logSpy.mock.calls[0];
    expect(callArgs[0]).toContain('[');
    expect(callArgs[0]).toContain(']');

    logSpy.mockRestore();
  });

  it('should allow logging when verbose is true', async () => {
    const plugin = loggerPlugin({ level: 'error' });
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: { verbose: true } } as any });

    logger.debug('Debug message');
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('should pass additional args to console methods', async () => {
    const plugin = loggerPlugin();
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    const obj = { key: 'value' };
    logger.info('Info:', obj);

    // Logger formats message as "[INFO] Info:" then passes additional args
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), obj);

    logSpy.mockRestore();
  });

  it('should handle empty log level gracefully', async () => {
    const plugin = loggerPlugin({ level: 'info' });
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.info('');
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('should filter info messages when level is warn', async () => {
    const plugin = loggerPlugin({ level: 'warn' });
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.info('Info message');
    expect(logSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('should filter warn messages when level is error', async () => {
    const plugin = loggerPlugin({ level: 'error' });
    plugin.install(kernel);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.warn('Warning message');
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('should handle multiple arguments', async () => {
    const plugin = loggerPlugin();
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.info('Message', 'arg1', 'arg2', { key: 'value' });
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('should respect both timestamp and log level options', async () => {
    const plugin = loggerPlugin({ level: 'debug', timestamp: true });
    plugin.install(kernel);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    let logger: any = null;
    kernel.on('command:before', async (data: any) => {
      logger = data.context.logger;
    });
    await kernel.emit('command:before', { context: { options: {} } as any });

    logger.debug('Debug with timestamp');
    expect(logSpy).toHaveBeenCalled();
    const callArgs = logSpy.mock.calls[0];
    expect(callArgs[0]).toContain('['); // Has timestamp bracket

    logSpy.mockRestore();
  });
});
