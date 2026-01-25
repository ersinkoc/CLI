/**
 * CLI Kernel tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CLIKernelImpl } from '../../src/kernel.js';
import type { CLIPlugin, CLIContext } from '../../src/types.js';

interface TestContext extends CLIContext {
  value?: number;
}

describe('CLIKernel', () => {
  let kernel: CLIKernelImpl<TestContext>;

  beforeEach(() => {
    kernel = new CLIKernelImpl<TestContext>();
  });

  it('should create kernel instance', () => {
    expect(kernel).toBeDefined();
  });

  it('should register plugin', () => {
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
    };

    kernel.register(plugin);
    expect(kernel.has('test')).toBe(true);
  });

  it('should throw on duplicate plugin name', () => {
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
    };

    kernel.register(plugin);
    expect(() => kernel.register(plugin)).toThrow('already registered');
  });

  it('should check plugin dependencies', () => {
    const plugin1: CLIPlugin<TestContext> = {
      name: 'plugin1',
      version: '1.0.0',
      install: () => {},
    };

    const plugin2: CLIPlugin<TestContext> = {
      name: 'plugin2',
      version: '1.0.0',
      dependencies: ['plugin1'],
      install: () => {},
    };

    kernel.register(plugin1);
    kernel.register(plugin2);
    expect(kernel.has('plugin2')).toBe(true);
  });

  it('should throw on missing dependency during initialize', async () => {
    const plugin: CLIPlugin<TestContext> = {
      name: 'plugin2',
      version: '1.0.0',
      dependencies: ['plugin1'],
      install: () => {},
    };

    // Registration succeeds - dependency checking is deferred to initialize()
    kernel.register(plugin);
    expect(kernel.has('plugin2')).toBe(true);

    // Initialize throws because plugin1 is not registered
    await expect(kernel.initialize()).rejects.toThrow('not registered');
  });

  it('should detect circular dependencies', async () => {
    const pluginA: CLIPlugin<TestContext> = {
      name: 'pluginA',
      version: '1.0.0',
      dependencies: ['pluginB'],
      install: () => {},
    };

    const pluginB: CLIPlugin<TestContext> = {
      name: 'pluginB',
      version: '1.0.0',
      dependencies: ['pluginA'],
      install: () => {},
    };

    kernel.register(pluginA);
    kernel.register(pluginB);

    await expect(kernel.initialize()).rejects.toThrow('Circular dependency');
  });

  it('should allow plugins to be registered in any order', async () => {
    const initOrder: string[] = [];

    const pluginA: CLIPlugin<TestContext> = {
      name: 'pluginA',
      version: '1.0.0',
      install: () => {},
      onInit: async () => {
        initOrder.push('A');
      },
    };

    const pluginB: CLIPlugin<TestContext> = {
      name: 'pluginB',
      version: '1.0.0',
      dependencies: ['pluginA'],
      install: () => {},
      onInit: async () => {
        initOrder.push('B');
      },
    };

    // Register B before A (dependency order reversed)
    kernel.register(pluginB);
    kernel.register(pluginA);

    await kernel.initialize();

    // A should be initialized before B despite registration order
    expect(initOrder).toEqual(['A', 'B']);
  });

  it('should unregister plugin', () => {
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
    };

    kernel.register(plugin);
    kernel.unregister('test');
    expect(kernel.has('test')).toBe(false);
  });

  it('should list all plugins', () => {
    const plugin1: CLIPlugin<TestContext> = {
      name: 'plugin1',
      version: '1.0.0',
      install: () => {},
    };

    const plugin2: CLIPlugin<TestContext> = {
      name: 'plugin2',
      version: '1.0.0',
      install: () => {},
    };

    kernel.register(plugin1);
    kernel.register(plugin2);

    const plugins = kernel.list();
    expect(plugins).toHaveLength(2);
  });

  it('should get plugin by name', () => {
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
    };

    kernel.register(plugin);
    expect(kernel.get('test')).toBe(plugin);
  });

  it('should emit and receive events', async () => {
    let received = false;
    kernel.on('test', () => {
      received = true;
    });

    await kernel.emit('test', null);
    expect(received).toBe(true);
  });

  it('should unsubscribe from events', () => {
    let count = 0;
    const unsubscribe = kernel.on('test', () => {
      count++;
    });

    kernel.emit('test', null);
    unsubscribe();
    kernel.emit('test', null);

    expect(count).toBe(1);
  });

  it('should pass data to event handlers', async () => {
    let receivedData: any;
    kernel.on('test', (...args: unknown[]) => {
      receivedData = args[0];
    });

    await kernel.emit('test', { value: 42 });
    expect(receivedData.value).toBe(42);
  });

  it('should handle async event handlers', async () => {
    let result = '';
    kernel.on('test', async (...args: unknown[]) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      result = 'done';
    });

    await kernel.emit('test', null);
    expect(result).toBe('done');
  });

  it('should get context', () => {
    const context = kernel.getContext();
    expect(context).toBeDefined();
  });

  it('should set context value', () => {
    kernel.setContextValue('value', 42);
    const context = kernel.getContext();
    expect(context.value).toBe(42);
  });

  it('should initialize plugins', async () => {
    let initialized = false;
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
      onInit: async () => {
        initialized = true;
      },
    };

    kernel.register(plugin);
    await kernel.initialize();
    expect(initialized).toBe(true);
  });

  it('should not initialize plugins twice', async () => {
    let initCount = 0;
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
      onInit: async () => {
        initCount++;
      },
    };

    kernel.register(plugin);
    await kernel.initialize();
    await kernel.initialize();
    expect(initCount).toBe(1);
  });

  it('should reset kernel', () => {
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
    };

    kernel.register(plugin);
    kernel.reset();
    expect(kernel.has('test')).toBe(false);
  });

  it('should call onDestroy when unregistering plugin', () => {
    let destroyed = false;
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
      onDestroy: () => {
        destroyed = true;
      },
    };

    kernel.register(plugin);
    kernel.unregister('test');
    expect(destroyed).toBe(true);
    expect(kernel.has('test')).toBe(false);
  });

  it('should handle onDestroy error with onError callback', () => {
    let errorHandled = false;
    const testError = new Error('Destroy failed');
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
      onDestroy: () => {
        throw testError;
      },
      onError: (error) => {
        if (error === testError) {
          errorHandled = true;
        }
      },
    };

    kernel.register(plugin);
    kernel.unregister('test');
    expect(errorHandled).toBe(true);
  });

  it('should handle onDestroy error without onError callback', () => {
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {},
      onDestroy: () => {
        throw new Error('Destroy failed');
      },
    };

    kernel.register(plugin);
    // Should not throw, error is silently caught
    expect(() => kernel.unregister('test')).not.toThrow();
    expect(kernel.has('test')).toBe(false);
  });

  it('should remove event listeners with off method', async () => {
    let count = 0;
    const handler = () => {
      count++;
    };

    kernel.on('test', handler);

    await kernel.emit('test', null);
    expect(count).toBe(1);

    kernel.off('test', handler);

    await kernel.emit('test', null);
    expect(count).toBe(1); // Should not increment again
  });

  it('should remove all event listeners for event when handler not specified', async () => {
    let count1 = 0;
    let count2 = 0;

    kernel.on('test', () => {
      count1++;
    });
    kernel.on('test', () => {
      count2++;
    });

    await kernel.emit('test', null);
    expect(count1).toBe(1);
    expect(count2).toBe(1);

    kernel.off('test');

    await kernel.emit('test', null);
    expect(count1).toBe(1); // Should not increment
    expect(count2).toBe(1); // Should not increment
  });

  it('should handle plugin install error with onError callback', () => {
    let errorHandled = false;
    const testError = new Error('Install failed');
    const plugin: CLIPlugin<TestContext> = {
      name: 'test',
      version: '1.0.0',
      install: () => {
        throw testError;
      },
      onError: (error) => {
        if (error === testError) {
          errorHandled = true;
        }
      },
    };

    expect(() => kernel.register(plugin)).toThrow(testError);
    expect(errorHandled).toBe(true);
  });

  it('should unregister non-existent plugin gracefully', () => {
    // Should not throw, just return silently
    expect(() => kernel.unregister('nonexistent')).not.toThrow();
  });
});
