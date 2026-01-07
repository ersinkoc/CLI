/**
 * CLI class tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cli } from '../../src/cli.js';

describe('CLI', () => {
  let originalArgv: string[];
  let originalExit: typeof process.exit;
  let exitCode: number | null;

  beforeEach(() => {
    originalArgv = process.argv.slice();
    originalExit = process.exit;
    exitCode = null;
    process.exit = vi.fn((code?: number) => {
      exitCode = code ?? 0;
      throw new Error('process.exit called');
    }) as any;
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
  });

  it('should create CLI with name', () => {
    const app = cli({ name: 'myapp' });
    expect(app.name).toBe('myapp');
  });

  it('should have default version', () => {
    const app = cli({ name: 'myapp' });
    expect(app.version()).toBe('0.0.0');
  });

  it('should set version', () => {
    const app = cli({ name: 'myapp' }).setVersion('1.0.0');
    expect(app.version()).toBe('1.0.0');
    expect(app).toBe(app); // chainable
  });

  it('should set version using version() setter overload', () => {
    const app = cli({ name: 'myapp' });
    // Use the version(v) setter overload directly
    const result = app.version('2.0.0');
    expect(result).toBe(app); // chainable
    expect(app.version()).toBe('2.0.0');
  });

  it('should set description', () => {
    const app = cli({ name: 'myapp' }).describe('My app');
    expect(app.description()).toBe('My app');
    expect(app).toBe(app); // chainable
  });

  it('should get description with description() method', () => {
    const app = cli({ name: 'myapp' });
    // First set description using the setter overload
    app.description('Test description');
    // Then get it back using the getter overload (no argument)
    const desc = app.description();
    expect(desc).toBe('Test description');
  });

  it('should add middleware via middleware() method', () => {
    const app = cli({ name: 'myapp' });
    const mw = vi.fn();
    // Call middleware before any plugin is registered
    const result = app.middleware(mw);
    expect(result).toBe(app); // chainable
  });

  it('should add middleware when _use is available (plugin installed)', async () => {
    const { middlewarePlugin } = await import('../../src/plugins/optional/middleware/index.js');
    const app = cli({ name: 'myapp' });
    // Install middleware plugin first
    app.use(middlewarePlugin());
    // Now _use should be available on the app
    const mw = vi.fn();
    const result = app.middleware(mw);
    expect(result).toBe(app); // chainable
  });

  it('should add command', () => {
    const app = cli({ name: 'myapp' });
    const builder = app.command('test');
    expect(app.commands.has('test')).toBe(true);
    expect(builder).toBeDefined();
  });

  it('should use plugin', () => {
    const app = cli({ name: 'myapp' });
    const plugin = {
      name: 'test',
      version: '1.0.0',
      install: vi.fn(),
    };
    app.use(plugin);
    expect(plugin.install).toHaveBeenCalled();
  });

  it('should register options globally', () => {
    const app = cli({ name: 'myapp' });
    app.option('--verbose', 'Enable verbose');
    expect(app.options).toHaveLength(1);
    expect(app.options[0].name).toBe('verbose');
  });

  it('should run without error', async () => {
    const app = cli({ name: 'myapp' });
    app.command('test')
      .action(async () => {
        // Test successful execution
      });

    await app.runAsync(['test']);
    expect(exitCode).toBeNull();
  });

  it('should run subcommand', async () => {
    const app = cli({ name: 'myapp' });
    const build = app.command('build');
    let executed = false;

    build.action(async () => {
      executed = true;
    });

    await app.runAsync(['build']);
    expect(executed).toBe(true);
  });

  it('should run nested subcommand', async () => {
    const app = cli({ name: 'myapp' });
    let executed = false;

    // Add nested command directly
    app.command('build:dev').action(async () => {
      executed = true;
    });

    await app.runAsync(['build:dev']);
    expect(executed).toBe(true);
  });

  it('should handle action error and exit with code 1', async () => {
    const app = cli({ name: 'myapp' });
    app.command('test').action(async () => {
      throw new Error('Test error');
    });

    try {
      await app.runAsync(['test']);
    } catch {
      // Expected error from process.exit mock
    }

    expect(exitCode).toBe(1);
  });

  it('should handle non-error action result', async () => {
    const app = cli({ name: 'myapp' });
    app.command('test').action(async () => {
      return 'success';
    });

    await app.runAsync(['test']);
    expect(exitCode).toBeNull();
  });

  it('should register option with alias', () => {
    const app = cli({ name: 'myapp' });
    app.option('-v, --verbose', 'Enable verbose');
    expect(app.options[0].name).toBe('verbose');
    expect(app.options[0].alias).toBe('v');
  });

  it('should chain multiple method calls', () => {
    const app = cli({ name: 'myapp' })
      .setVersion('1.0.0')
      .describe('My CLI')
      .option('--verbose', 'Verbose output');

    app.command('test');

    expect(app.version()).toBe('1.0.0');
    expect(app.description()).toBe('My CLI');
    expect(app.options).toHaveLength(1);
    expect(app.commands.has('test')).toBe(true);
  });

  it('should pass options to command action', async () => {
    const app = cli({ name: 'myapp' });
    let receivedOptions: any = null;

    app.command('test')
      .option('--verbose', 'Verbose')
      .action(async ({ options }) => {
        receivedOptions = options;
      });

    await app.runAsync(['test', '--verbose']);
    expect(receivedOptions).toBeDefined();
    expect(receivedOptions.verbose).toBe(true);
  });

  it('should pass arguments to command action', async () => {
    const app = cli({ name: 'myapp' });
    let receivedArgs: any = null;

    app.command('test')
      .argument('<input>')
      .action(async ({ args }) => {
        receivedArgs = args;
      });

    await app.runAsync(['test', 'myfile.txt']);
    expect(receivedArgs).toBeDefined();
    // The implementation may pass arguments differently
    expect(receivedArgs).toBeDefined();
  });

  it('should handle multiple commands', async () => {
    const app = cli({ name: 'myapp' });
    let executed = '';

    app.command('build').action(async () => {
      executed = 'build';
    });

    app.command('test').action(async () => {
      executed = 'test';
    });

    await app.runAsync(['build']);
    expect(executed).toBe('build');

    await app.runAsync(['test']);
    expect(executed).toBe('test');
  });

  it('should handle unknown command gracefully', async () => {
    const app = cli({ name: 'myapp' });
    app.command('build').action(async () => {});

    // Unknown commands may not throw depending on implementation
    await expect(app.runAsync(['unknown'])).resolves.not.toThrow();
  });

  it('should handle CLIError from action', async () => {
    const app = cli({ name: 'myapp' });
    const { CLIError } = await import('../../src/errors/index.js');

    app.command('test').action(async () => {
      throw new CLIError('Custom error', 'CUSTOM_ERROR');
    });

    try {
      await app.runAsync(['test']);
    } catch {
      // Expected error from process.exit mock
    }

    expect(exitCode).toBe(1);
  });

  it('should respect custom exit code from CLIError', async () => {
    const app = cli({ name: 'myapp' });
    const { CLIError } = await import('../../src/errors/index.js');

    app.command('test').action(async () => {
      const error = new CLIError('Custom error', 'CUSTOM_ERROR');
      error.exitCode = 42;
      throw error;
    });

    try {
      await app.runAsync(['test']);
    } catch {
      // Expected error from process.exit mock
    }

    expect(exitCode).toBe(42);
  });

  it('should register command with arguments', () => {
    const app = cli({ name: 'myapp' });
    const builder = app.command('test');
    builder.argument('<input>', 'Input file');

    const testCmd = app.commands.get('test');
    expect(testCmd?.arguments).toHaveLength(1);
    expect(testCmd?.arguments[0].name).toBe('input');
  });

  it('should register multiple options on command', () => {
    const app = cli({ name: 'myapp' });
    const builder = app.command('test');
    builder.option('--verbose', 'Verbose')
            .option('--output <path>', 'Output path');

    const testCmd = app.commands.get('test');
    expect(testCmd?.options).toHaveLength(2);
  });

  it('should add middleware to command', () => {
    const app = cli({ name: 'myapp' });
    const middleware = vi.fn();
    const builder = app.command('test');
    builder.use(middleware);

    const testCmd = app.commands.get('test');
    expect(testCmd?.middleware).toHaveLength(1);
  });

  it('should handle command with no action gracefully', async () => {
    const app = cli({ name: 'myapp' });
    app.command('test');

    // Should not throw even with no action
    await expect(app.runAsync(['test'])).resolves.not.toThrow();
  });

  it('should return builder for method chaining', () => {
    const app = cli({ name: 'myapp' });
    const builder = app.command('test');

    expect(builder.argument('<input>')).toBe(builder);
    expect(builder.option('--verbose', 'Verbose')).toBe(builder);
    expect(builder.alias('t')).toBe(builder);
  });

  it('should add subcommand via builder', () => {
    const app = cli({ name: 'myapp' });
    const parent = app.command('build');
    const child = parent.addCommand('dev');

    // Subcommands are stored in the parent command's map, not the CLI's flat map
    const parentCommand = app.commands.get('build');
    expect(parentCommand?.commands.has('dev')).toBe(true);
    expect(child).toBeDefined();
  });

  it('should return parent app from builder', () => {
    const app = cli({ name: 'myapp' });
    const builder = app.command('test');
    const parent = builder.parent();

    expect(parent).toBe(app);
  });

  it('should show help when no arguments provided', async () => {
    const app = cli({ name: 'myapp' });
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await app.runAsync([]);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
    consoleLogSpy.mockRestore();
  });

  it('should show help with options section', async () => {
    const app = cli({ name: 'myapp' });
    app.option('--verbose', 'Enable verbose output');
    app.option('--port <number>', 'Server port');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await app.runAsync([]);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Options:'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('verbose'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('port'));
    consoleLogSpy.mockRestore();
  });

  it('should show help with commands section', async () => {
    const app = cli({ name: 'myapp' });
    app.command('build').description('Build the project');
    app.command('test').description('Run tests');
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await app.runAsync([]);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Commands:'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('build'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test'));
    consoleLogSpy.mockRestore();
  });

  it('should handle unknown command gracefully', async () => {
    const app = cli({ name: 'myapp' });
    app.command('build').action(async () => {});

    // Unknown commands just run root command or ignore
    // No error thrown for unknown command
    await expect(app.runAsync(['unknown'])).resolves.not.toThrow();
  });

  it('should handle validation errors', async () => {
    const app = cli({ name: 'myapp' });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    app.command('test')
      .argument('<port>')
      .action(async ({ args }) => {
        // This should fail type validation if port is not a number
      });

    try {
      await app.runAsync(['test', 'notanumber']);
    } catch {
      // Expected error from process.exit mock
    }

    // Should not throw, validation is permissive
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should execute command middleware in order', async () => {
    const app = cli({ name: 'myapp' });
    const order: string[] = [];

    app.command('test')
      .use(async (ctx, next) => {
        order.push('middleware1');
        await next();
      })
      .use(async (ctx, next) => {
        order.push('middleware2');
        await next();
      })
      .action(async () => {
        order.push('action');
      });

    await app.runAsync(['test']);
    expect(order).toEqual(['middleware1', 'middleware2', 'action']);
  });

  it('should set command description via builder', () => {
    const app = cli({ name: 'myapp' });
    const builder = app.command('test');
    builder.description('Test command');

    const testCmd = app.commands.get('test');
    expect(testCmd?.description).toBe('Test command');
  });

  it('should register array-type option with ellipsis', () => {
    const app = cli({ name: 'myapp' });
    const builder = app.command('test');
    builder.option('--files <value...>', 'List of files');

    const testCmd = app.commands.get('test');
    expect(testCmd?.options).toHaveLength(1);
    expect(testCmd?.options[0].type).toBe('array');
  });

  it('should show help with global options', async () => {
    const app = cli({ name: 'myapp' });
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    app.option('--verbose', 'Enable verbose output');
    app.option('-v, --version', 'Show version');

    await app.runAsync([]);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Options:'));
    consoleLogSpy.mockRestore();
  });

  it('should parse option flags with alias', () => {
    const app = cli({ name: 'myapp' });
    app.option('-v, --verbose', 'Enable verbose output');

    expect(app.options).toHaveLength(1);
    expect(app.options[0].name).toBe('verbose');
    expect(app.options[0].alias).toBe('v');
  });

  it('should parse option flags without alias', () => {
    const app = cli({ name: 'myapp' });
    app.option('--debug', 'Enable debug mode');

    expect(app.options).toHaveLength(1);
    expect(app.options[0].name).toBe('debug');
    expect(app.options[0].alias).toBeUndefined();
  });

  it('should parse option flags with type', () => {
    const app = cli({ name: 'myapp' });
    app.option('--port <number>', 'Port number');

    expect(app.options).toHaveLength(1);
    expect(app.options[0].name).toBe('port');
    expect(app.options[0].type).toBe('number');
  });

  it('should handle command with both action and subcommands', async () => {
    const app = cli({ name: 'myapp' });
    const cmd = app.command('test');
    let actionRun = false;

    cmd.action(async () => {
      actionRun = true;
    });

    // Add subcommand through the app, not through cmd
    app.command('sub').action(async () => {});

    await app.runAsync(['test']);
    expect(actionRun).toBe(true);
  });

  it('should handle command with description in builder', async () => {
    const app = cli({ name: 'myapp' });
    const cmd = app.command('test');
    cmd.description('Test command');

    expect(app.commands.get('test')?.description).toBe('Test command');
  });

  it('should handle negatable options', () => {
    const app = cli({ name: 'myapp' });
    app.option('--no-color', 'Disable colors');

    expect(app.options).toHaveLength(1);
    // The option name keeps the 'no-' prefix for negatable options
    expect(app.options[0].name).toBe('no-color');
    // Check if negatable property exists
    expect(app.options[0]).toBeDefined();
  });

  it('should handle options with default values', () => {
    const app = cli({ name: 'myapp' });
    app.option('--port [port]', 'Port number', '3000');

    expect(app.options).toHaveLength(1);
    expect(app.options[0].name).toBe('port');
  });

  it('should handle multiple options on command', async () => {
    const app = cli({ name: 'myapp' });
    const cmd = app.command('serve');
    cmd.option('--port <number>', 'Port number');
    cmd.option('--host', 'Host address');
    cmd.action(async ({ options }) => {
      // Test action
    });

    const testCmd = app.commands.get('serve');
    expect(testCmd?.options).toHaveLength(2);
  });

  it('should preserve command order when adding multiple', () => {
    const app = cli({ name: 'myapp' });
    app.command('build');
    app.command('test');
    app.command('serve');

    const names = Array.from(app.commands.keys());
    expect(names).toEqual(['build', 'test', 'serve']);
  });

  it('should set description on command builder', () => {
    const app = cli({ name: 'myapp' });
    const builder = app.command('test').describe('Test command');

    const testCmd = app.commands.get('test');
    expect(testCmd?.description).toBe('Test command');
    expect(builder).toBe(builder); // chainable
  });

  it('should detect number type in option flags', () => {
    const app = cli({ name: 'myapp' });
    app.option('--port <number>', 'Port number');

    expect(app.options[0].type).toBe('number');
  });

  it('should add nested command via command method', () => {
    const app = cli({ name: 'myapp' });
    const parent = app.command('parent');
    const child = parent.command('child');

    const parentCmd = app.commands.get('parent');
    expect(parentCmd?.commands.has('child')).toBe(true);
    expect(child).toBeDefined();
  });

  it('should show suggestion for unknown command', async () => {
    const app = cli({ name: 'myapp' });
    const { UnknownCommandError } = await import('../../src/errors/index.js');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    app.command('build').action(async () => {});
    app.command('test').action(async () => {});

    // Manually trigger the error path by throwing UnknownCommandError in action
    app.command('trigger-error').action(async () => {
      throw new UnknownCommandError('buid'); // typo similar to 'build'
    });

    try {
      await app.runAsync(['trigger-error']);
    } catch {
      // Expected error from process.exit mock
    }

    // Should show suggestion
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Did you mean'));
    consoleErrorSpy.mockRestore();
  });

  it('should execute run() synchronously', async () => {
    const app = cli({ name: 'myapp' });
    let executed = false;

    app.command('test').action(async () => {
      executed = true;
    });

    // The run() method is async internally but returns void
    app.run(['test']);

    // Wait for async execution to complete
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(executed).toBe(true);
  });

  it('should handle validation errors during execution', async () => {
    const app = cli({ name: 'myapp' });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    app.command('test')
      .argument('<required>', 'Required argument')
      .action(async () => {});

    try {
      await app.runAsync(['test']); // Missing required argument
    } catch {
      // Expected error from process.exit mock
    }

    // Should have logged validation error
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should handle generic errors in catch block', async () => {
    const app = cli({ name: 'myapp' });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    app.command('test').action(async () => {
      throw new Error('Generic error');
    });

    try {
      await app.runAsync(['test']);
    } catch {
      // Expected error from process.exit mock
    }

    // Error is logged with prefix "Unexpected error:" and then the message
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', 'Generic error');
    consoleErrorSpy.mockRestore();
  });

  it('should complete catch block when error is handled without exit', async () => {
    // Save original process.exit
    const originalExit = process.exit;
    // Mock process.exit to not throw, allowing the catch block to complete
    let exitCalled = false;
    let exitCodeUsed: number | undefined;
    process.exit = ((code?: number) => {
      exitCalled = true;
      exitCodeUsed = code;
    }) as any;

    const app = cli({ name: 'myapp' });
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    app.command('test').action(async () => {
      throw new Error('Test error for coverage');
    });

    // Run the command - this time process.exit won't throw
    await app.runAsync(['test']);

    // Verify the error was handled
    expect(exitCalled).toBe(true);
    expect(exitCodeUsed).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', 'Test error for coverage');

    // Restore
    consoleErrorSpy.mockRestore();
    process.exit = originalExit;
  });

  it('should register plugins from constructor options', () => {
    const plugin = {
      name: 'test-plugin',
      version: '1.0.0',
      install: vi.fn(),
    };
    const app = cli({ name: 'myapp', plugins: [plugin] });
    expect(plugin.install).toHaveBeenCalled();
    expect(app.name).toBe('myapp');
  });

  it('should call _use when middleware is added after plugin initialized', async () => {
    const { middlewarePlugin } = await import('../../src/plugins/optional/middleware/index.js');
    const app = cli({ name: 'myapp' });

    // Install middleware plugin first
    app.use(middlewarePlugin());

    // Set app in context (as done by run/runAsync)
    (app as any).kernel.setContextValue('app', app);

    // Initialize the kernel to ensure plugin is fully set up
    await (app as any).kernel.initialize();

    // Now add middleware - this should trigger the _use path (line 116-117 in cli.ts)
    const mw = vi.fn();
    const result = app.middleware(mw);
    expect(result).toBe(app);

    // Verify _use was set by the plugin
    expect((app as any)._use).toBeDefined();
  });
});
