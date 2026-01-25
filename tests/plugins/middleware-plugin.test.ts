/**
 * Middleware Plugin tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '../../src/events/index.js';
import { middlewarePlugin, requireAuth } from '../../src/plugins/optional/middleware/index.js';
import type { Command } from '../../src/types.js';

describe('Middleware Plugin', () => {
  let bus: EventBus;
  let mockApp: any;
  let mockCommand: Command;
  let mockContext: any;

  beforeEach(() => {
    bus = new EventBus();
    mockApp = {
      _addGlobalMiddleware: undefined as any,
      _middlewarePluginActive: false,
    };
    mockCommand = {
      name: 'deploy',
      middleware: [],
    };
    mockContext = {
      app: mockApp,
      command: mockCommand,
      args: {},
      options: {},
    };
  });

  it('should have plugin metadata', () => {
    const plugin = middlewarePlugin();
    expect(plugin.name).toBe('middleware');
    expect(plugin.version).toBe('1.0.0');
    expect(plugin.install).toBeInstanceOf(Function);
  });

  it('should add _addGlobalMiddleware method to app on init', async () => {
    const plugin = middlewarePlugin();
    plugin.install(bus);
    await plugin.onInit(mockContext);
    expect(mockApp._addGlobalMiddleware).toBeInstanceOf(Function);
  });

  it('should set _middlewarePluginActive flag on init', async () => {
    const plugin = middlewarePlugin();
    plugin.install(bus);
    await plugin.onInit(mockContext);
    expect(mockApp._middlewarePluginActive).toBe(true);
  });

  it('should execute global middleware before command', async () => {
    let executed = false;
    const plugin = middlewarePlugin();
    plugin.install(bus);

    // Add global middleware
    await plugin.onInit(mockContext);
    mockApp._addGlobalMiddleware(async (ctx: any, next: () => Promise<void>) => {
      executed = true;
      await next();
    });

    await bus.emit('command:before', mockContext);
    expect(executed).toBe(true);
  });

  it('should execute command-specific middleware', async () => {
    let executed = false;
    const plugin = middlewarePlugin();
    plugin.install(bus);

    // Add command-specific middleware
    mockCommand.middleware = [
      async (ctx: any, next: () => Promise<void>) => {
        executed = true;
        await next();
      },
    ];

    await bus.emit('command:before', mockContext);
    expect(executed).toBe(true);
  });

  it('should execute global middleware before command middleware', async () => {
    const order: string[] = [];
    const plugin = middlewarePlugin();
    plugin.install(bus);

    await plugin.onInit(mockContext);

    mockApp._addGlobalMiddleware(async (ctx: any, next: () => Promise<void>) => {
      order.push('global');
      await next();
    });

    mockCommand.middleware = [
      async (ctx: any, next: () => Promise<void>) => {
        order.push('command');
        await next();
      },
    ];

    await bus.emit('command:before', mockContext);
    expect(order).toEqual(['global', 'command']);
  });

  it('should execute multiple middleware in order', async () => {
    const order: string[] = [];
    const plugin = middlewarePlugin();
    plugin.install(bus);

    await plugin.onInit(mockContext);

    mockApp._addGlobalMiddleware(async (ctx: any, next: () => Promise<void>) => {
      order.push('mw1');
      await next();
    });

    mockApp._addGlobalMiddleware(async (ctx: any, next: () => Promise<void>) => {
      order.push('mw2');
      await next();
    });

    await bus.emit('command:before', mockContext);
    expect(order).toEqual(['mw1', 'mw2']);
  });

  it('should support middleware that does not call next', async () => {
    let executed = false;
    const plugin = middlewarePlugin();
    plugin.install(bus);

    await plugin.onInit(mockContext);

    mockApp._addGlobalMiddleware(async (ctx: any, next: () => Promise<void>) => {
      executed = true;
      // Don't call next()
    });

    mockCommand.middleware = [
      async (ctx: any, next: () => Promise<void>) => {
        // This should not execute
        executed = false;
      },
    ];

    await bus.emit('command:before', mockContext);
    expect(executed).toBe(true);
  });

  it('should handle middleware errors gracefully', async () => {
    const plugin = middlewarePlugin();
    plugin.install(bus);

    await plugin.onInit(mockContext);

    mockApp._addGlobalMiddleware(async (ctx: any, next: () => Promise<void>) => {
      throw new Error('Middleware error');
    });

    await expect(bus.emit('command:before', mockContext)).rejects.toThrow('Middleware error');
  });

  it('should handle command without middleware', async () => {
    const plugin = middlewarePlugin();
    plugin.install(bus);
    mockCommand.middleware = undefined;
    await expect(bus.emit('command:before', mockContext)).resolves.not.toThrow();
  });

  it('should handle empty middleware array', async () => {
    const plugin = middlewarePlugin();
    plugin.install(bus);
    mockCommand.middleware = [];
    await expect(bus.emit('command:before', mockContext)).resolves.not.toThrow();
  });

  it('should handle command with only global middleware', async () => {
    let executed = false;
    const plugin = middlewarePlugin();
    plugin.install(bus);

    await plugin.onInit(mockContext);

    mockApp._addGlobalMiddleware(async (ctx: any, next: () => Promise<void>) => {
      executed = true;
      await next();
    });

    mockCommand.middleware = undefined;

    await bus.emit('command:before', mockContext);
    expect(executed).toBe(true);
  });

  it('should handle command with only command middleware', async () => {
    let executed = false;
    const plugin = middlewarePlugin();
    plugin.install(bus);

    await plugin.onInit(mockContext);

    mockCommand.middleware = [
      async (ctx: any, next: () => Promise<void>) => {
        executed = true;
        await next();
      },
    ];

    await bus.emit('command:before', mockContext);
    expect(executed).toBe(true);
  });
});

describe('requireAuth', () => {
  it('should create authentication middleware', async () => {
    let called = false;
    const next = async () => {
      called = true;
    };

    const getToken = vi.fn(() => 'valid-token');
    const middleware = requireAuth(getToken);

    await middleware({ options: { token: 'valid-token' } } as any, next);
    expect(getToken).toHaveBeenCalled();
    expect(called).toBe(true);
  });

  it('should throw error when token is missing', async () => {
    const getToken = vi.fn(() => undefined);
    const middleware = requireAuth(getToken);

    await expect(middleware({ options: {} } as any, async () => {}))
      .rejects.toThrow('Authentication required');
  });

  it('should use custom getToken function', async () => {
    const getToken = (ctx: any) => ctx?.options?.apiToken;
    const middleware = requireAuth(getToken);
    const next = async () => {};

    await middleware({ options: { apiToken: 'my-token' } } as any, next);
  });

  it('should throw when getToken returns empty string', async () => {
    const getToken = () => '';
    const middleware = requireAuth(getToken);

    await expect(middleware({ options: {} } as any, async () => {}))
      .rejects.toThrow('Authentication required');
  });

  it('should throw when getToken returns null', async () => {
    const getToken = () => null;
    const middleware = requireAuth(getToken);

    await expect(middleware({ options: {} } as any, async () => {}))
      .rejects.toThrow('Authentication required');
  });

  it('should pass context to getToken function', async () => {
    const mockContext = { options: { token: 'test' }, args: {} };
    const getToken = vi.fn((ctx: any) => ctx?.options?.token);
    const middleware = requireAuth(getToken);
    const next = async () => {};

    await middleware(mockContext as any, next);
    expect(getToken).toHaveBeenCalledWith(mockContext);
  });

  it('should call next when authentication succeeds', async () => {
    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };
    const getToken = () => 'valid-token';
    const middleware = requireAuth(getToken);

    await middleware({ options: { token: 'valid-token' } } as any, next);
    expect(nextCalled).toBe(true);
  });

  it('should not call next when authentication fails', async () => {
    let nextCalled = false;
    const next = async () => {
      nextCalled = true;
    };
    const getToken = () => undefined;
    const middleware = requireAuth(getToken);

    try {
      await middleware({ options: {} } as any, next);
    } catch {
      // Expected to throw
    }
    expect(nextCalled).toBe(false);
  });
});
