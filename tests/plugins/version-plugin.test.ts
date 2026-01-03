/**
 * Version Plugin tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { versionPlugin, type VersionPluginOptions } from '../../src/plugins/core/version.js';
import { CLIKernelImpl } from '../../src/kernel.js';

describe('Version Plugin', () => {
  let kernel: CLIKernelImpl;

  beforeEach(() => {
    kernel = new CLIKernelImpl();
  });

  it('should create version plugin', () => {
    const plugin = versionPlugin();
    expect(plugin.name).toBe('version');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should create version plugin with custom version', () => {
    const plugin = versionPlugin({ version: '2.0.0' });
    expect(plugin).toBeDefined();
  });

  it('should create version plugin with custom format', () => {
    const customFormat = vi.fn(() => 'v2.0.0');
    const plugin = versionPlugin({ format: customFormat });
    expect(plugin).toBeDefined();
  });

  it('should listen for version event', async () => {
    const plugin = versionPlugin();
    plugin.install(kernel);

    let received = false;
    kernel.on('version', async (...args: unknown[]) => {
      received = true;
      expect(args[0]).toBeDefined();
    });

    await kernel.emit('version', { version: '1.0.0' });
    expect(received).toBe(true);
  });

  it('should use custom format', async () => {
    const customFormat = vi.fn(() => 'Custom v2.0.0');
    const plugin = versionPlugin({ format: customFormat });
    plugin.install(kernel);

    // The plugin should call the custom format function
    await kernel.emit('version', { version: '1.0.0' });
    expect(customFormat).toHaveBeenCalledWith('1.0.0');
  });

  it('should use default version when custom not provided', async () => {
    const plugin = versionPlugin();
    plugin.install(kernel);

    let receivedVersion: string | undefined;
    kernel.on('version', async (...args: unknown[]) => {
      const data = args[0] as { version: string };
      receivedVersion = data.version;
    });

    await kernel.emit('version', { version: '1.5.0' });
    expect(receivedVersion).toBe('1.5.0');
  });

  it('should have correct plugin structure', () => {
    const plugin = versionPlugin({ version: '2.5.0' });
    expect(plugin).toHaveProperty('name');
    expect(plugin).toHaveProperty('version');
    expect(plugin).toHaveProperty('install');
    expect(typeof plugin.install).toBe('function');
  });

  it('should check for --version option in command:before', async () => {
    const plugin = versionPlugin();
    plugin.install(kernel);

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    const mockApp = { version: '1.5.0' };
    const mockContext = {
      options: { version: true },
      app: mockApp,
    };

    try {
      await kernel.emit('command:before', { context: mockContext });
    } catch {
      // Expected from process.exit mock
    }

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('1.5.0'));
    consoleLogSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should check for -V option in command:before', async () => {
    const plugin = versionPlugin();
    plugin.install(kernel);

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    const mockApp = { version: '2.0.0' };
    const mockContext = {
      options: { V: true },
      app: mockApp,
    };

    try {
      await kernel.emit('command:before', { context: mockContext });
    } catch {
      // Expected from process.exit mock
    }

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('2.0.0'));
    consoleLogSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
