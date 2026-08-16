/**
 * Object Config API tests
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { cli } from '../../src/cli.js';
import { cli as configCli } from '../../src/api/config.js';

describe('Object Config API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create CLI from config object', () => {
    const app = cli({
      name: 'myapp',
      version: '1.0.0',
      description: 'My app',
    });

    expect(app.name).toBe('myapp');
    expect(app.version()).toBe('1.0.0');
    expect(app.description()).toBe('My app');
  });

  it('should register commands from config', () => {
    const app = cli({
      name: 'myapp',
      commands: {
        build: {
          description: 'Build the project',
        },
        test: {
          description: 'Run tests',
        },
      },
    });

    expect(app.commands.has('build')).toBe(true);
    expect(app.commands.has('test')).toBe(true);
    expect(app.commands.get('build')?.description).toBe('Build the project');
  });

  it('should register nested subcommands from config', () => {
    const app = cli({
      name: 'myapp',
      commands: {
        config: {
          description: 'Config management',
          commands: {
            get: { description: 'Get a value' },
            set: { description: 'Set a value' },
          },
        },
      },
    });

    const configCmd = app.commands.get('config');
    expect(configCmd?.commands.has('get')).toBe(true);
    expect(configCmd?.commands.has('set')).toBe(true);
  });

  it('should register arguments from config', () => {
    const app = cli({
      name: 'myapp',
      commands: {
        greet: {
          arguments: {
            name: { type: 'string', required: true, description: 'Who to greet' },
          },
        },
      },
    });

    const greet = app.commands.get('greet');
    expect(greet?.arguments).toHaveLength(1);
    expect(greet?.arguments[0].name).toBe('name');
    expect(greet?.arguments[0].required).toBe(true);
  });

  it('should register options from config', () => {
    const app = cli({
      name: 'myapp',
      commands: {
        serve: {
          options: {
            port: { type: 'number', alias: 'p', default: 3000 },
            watch: { type: 'boolean', alias: 'w' },
          },
        },
      },
    });

    const serve = app.commands.get('serve');
    expect(serve?.options).toHaveLength(2);
    const port = serve?.options.find((o) => o.name === 'port');
    expect(port?.alias).toBe('p');
    expect(port?.type).toBe('number');
  });

  it('should register global options from config', () => {
    const app = cli({
      name: 'myapp',
      options: {
        verbose: { type: 'boolean', description: 'Verbose output' },
      },
    });

    expect(app.options).toHaveLength(1);
    expect(app.options[0].name).toBe('verbose');
  });

  it('should apply command aliases from config', () => {
    const app = cli({
      name: 'myapp',
      commands: {
        build: {
          aliases: ['b'],
        },
      },
    });

    expect(app.commands.get('build')?.aliases).toContain('b');
  });

  it('should wire action handlers from config', async () => {
    const handler = vi.fn();
    const app = cli({
      name: 'myapp',
      commands: {
        build: {
          action: handler,
        },
      },
    });

    await app.runAsync(['build']);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should pass parsed args and options to config actions', async () => {
    let received: { args: Record<string, unknown>; options: Record<string, unknown> } | null = null;
    const app = cli({
      name: 'myapp',
      commands: {
        greet: {
          arguments: { name: { type: 'string', required: true } },
          options: { loud: { type: 'boolean' } },
          action: async (ctx) => {
            received = { args: ctx.args, options: ctx.options };
          },
        },
      },
    });

    await app.runAsync(['greet', 'World', '--loud']);

    expect(received).not.toBeNull();
    expect(received!.args.name).toBe('World');
    expect(received!.options.loud).toBe(true);
  });

  it('should support variadic arguments from config', () => {
    const app = cli({
      name: 'myapp',
      commands: {
        copy: {
          arguments: {
            files: { type: 'string', variadic: true, required: true },
          },
        },
      },
    });

    const copy = app.commands.get('copy');
    expect(copy?.arguments[0].variadic).toBe(true);
  });

  it('should register middleware from config', () => {
    const mw = vi.fn();
    const app = cli({
      name: 'myapp',
      commands: {
        build: {
          middleware: [mw],
        },
      },
    });

    expect(app.commands.get('build')?.middleware).toHaveLength(1);
  });

  it('should register plugins from config', () => {
    const plugin = {
      name: 'test-plugin',
      version: '1.0.0',
      install: vi.fn(),
    };
    const app = cli({ name: 'myapp', plugins: [plugin] });
    expect(plugin.install).toHaveBeenCalledTimes(1);
    expect(app.name).toBe('myapp');
  });

  it('should execute nested command from config', async () => {
    const inner = vi.fn();
    const app = cli({
      name: 'myapp',
      commands: {
        config: {
          commands: {
            get: {
              action: inner,
            },
          },
        },
      },
    });

    await app.runAsync(['config', 'get']);
    expect(inner).toHaveBeenCalledTimes(1);
  });

  it('should re-export cli from the config subpath module', () => {
    expect(configCli).toBe(cli);
  });

  it('should support default values for config options', async () => {
    let port: unknown;
    const app = cli({
      name: 'myapp',
      commands: {
        serve: {
          options: { port: { type: 'number', default: 3000 } },
          action: async (ctx) => {
            port = ctx.options.port;
          },
        },
      },
    });

    await app.runAsync(['serve']);
    expect(port).toBe(3000);
  });
});
