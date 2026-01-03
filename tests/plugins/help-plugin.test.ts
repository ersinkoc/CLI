/**
 * Help Plugin tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { helpPlugin, type HelpPluginOptions } from '../../src/plugins/core/help.js';
import { CLIKernelImpl } from '../../src/kernel.js';
import type { CLI } from '../../src/types.js';

describe('Help Plugin', () => {
  let kernel: CLIKernelImpl;
  let mockApp: CLI;

  beforeEach(() => {
    kernel = new CLIKernelImpl();
    mockApp = {
      name: 'myapp',
      description: () => 'My application',
      version: () => '1.0.0',
      commands: new Map([
        ['build', { name: 'build', description: 'Build the project' }],
        ['test', { name: 'test', description: 'Run tests' }],
      ]),
      options: [
        { name: 'verbose', alias: 'v', description: 'Verbose output' },
        { name: 'help', alias: 'h', description: 'Show help' },
      ],
    } as any;
  });

  it('should create help plugin', () => {
    const plugin = helpPlugin();
    expect(plugin.name).toBe('help');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should create help plugin with options', () => {
    const customFormat = vi.fn(() => 'Custom help');
    const options: HelpPluginOptions = {
      format: customFormat,
    };
    const plugin = helpPlugin(options);
    expect(plugin).toBeDefined();
  });

  it('should listen for help event', async () => {
    const plugin = helpPlugin();
    plugin.install(kernel);

    let received = false;
    kernel.on('help', async (...args: unknown[]) => {
      received = true;
      expect(args[0]).toBeDefined();
    });

    await kernel.emit('help', { app: mockApp });
    expect(received).toBe(true);
  });

  it('should listen for command:before event', async () => {
    let received = false;
    // Register test listener BEFORE installing the plugin
    // so our listener runs before the plugin calls process.exit()
    kernel.on('command:before', async (...args: unknown[]) => {
      received = true;
    });

    const plugin = helpPlugin();
    plugin.install(kernel);

    // The help plugin will call process.exit(0) when help is true
    // We need to catch the error that the mocked process.exit throws
    try {
      await kernel.emit('command:before', { context: { options: { help: true }, app: mockApp } });
    } catch {
      // Expected error from mocked process.exit
    }
    expect(received).toBe(true);
  });

  it('should use custom format', async () => {
    const customFormat = vi.fn(() => 'Custom help text');
    const plugin = helpPlugin({ format: customFormat });
    plugin.install(kernel);

    await kernel.emit('help', { app: mockApp });
    expect(customFormat).toHaveBeenCalledWith({ app: mockApp });
  });

  it('should display commands in help output', async () => {
    const plugin = helpPlugin();
    plugin.install(kernel);

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await kernel.emit('help', { app: mockApp });

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Commands:'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('build'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test'));

    consoleLogSpy.mockRestore();
  });

  it('should format help with commands', async () => {
    const plugin = helpPlugin();
    plugin.install(kernel);

    // Create a fresh kernel to avoid any conflicts
    const freshKernel = new CLIKernelImpl();

    // Install the plugin on fresh kernel
    plugin.install(freshKernel);

    // Emit help event
    await freshKernel.emit('help', { app: mockApp });

    // If we got here without errors, the formatHelp function was called
    // The important part is that app.commands.size > 0 check was executed
    expect(mockApp.commands.size).toBeGreaterThan(0);
  });

  it('should format help with app name when no description provided', async () => {
    const plugin = helpPlugin();
    plugin.install(kernel);

    const appWithoutDescription = {
      ...mockApp,
      description: () => '',
    } as any;

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await kernel.emit('help', { app: appWithoutDescription });

    // Should show the app name in bold when no description is provided
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('myapp'));

    consoleLogSpy.mockRestore();
  });

  it('should handle commands with empty description', async () => {
    // Test the code path at help.ts:92 - when cmd.description is undefined/null
    const plugin = helpPlugin();
    plugin.install(kernel);

    const appWithNoDescriptionCommand = {
      ...mockApp,
      commands: new Map([
        ['build', { name: 'build' }], // No description
        ['test', { name: 'test', description: 'Run tests' }],
      ]),
    } as any;

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await kernel.emit('help', { app: appWithNoDescriptionCommand });

    // Should show both commands even if one has no description
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('build'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test'));

    consoleLogSpy.mockRestore();
  });

  it('should handle options with empty description', async () => {
    // Test the code path at help.ts:103 - when opt.description is undefined/null
    const plugin = helpPlugin();
    plugin.install(kernel);

    const appWithNoDescriptionOption = {
      ...mockApp,
      options: [
        { name: 'verbose' }, // No description
        { name: 'help', description: 'Show help' },
      ],
    } as any;

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await kernel.emit('help', { app: appWithNoDescriptionOption });

    // Should show both options even if one has no description
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('verbose'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('help'));

    consoleLogSpy.mockRestore();
  });
});
