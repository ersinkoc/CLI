/**
 * Decorator API tests
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  CLI,
  Command,
  Argument,
  Option,
  CLIApplication,
} from '../../src/api/decorator.js';

describe('Decorator API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should attach CLI options via @CLI', () => {
    @CLI({ name: 'myapp', version: '1.0.0', description: 'My app' })
    class MyApp extends CLIApplication {}

    const app = new MyApp().toCLI();
    expect(app.name).toBe('myapp');
    expect(app.version()).toBe('1.0.0');
    expect(app.description()).toBe('My app');
  });

  it('should register a command via @Command', () => {
    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      @Command('build', { description: 'Build the project' })
      build() {}
    }

    const app = new MyApp().toCLI();
    expect(app.commands.has('build')).toBe(true);
    expect(app.commands.get('build')?.description).toBe('Build the project');
  });

  it('should default command name to the method name', () => {
    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      @Command()
      deploy() {}
    }

    const app = new MyApp().toCLI();
    expect(app.commands.has('deploy')).toBe(true);
  });

  it('should support command aliases via @Command', () => {
    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      @Command('build', { aliases: ['b'] })
      build() {}
    }

    const app = new MyApp().toCLI();
    expect(app.commands.get('build')?.aliases).toContain('b');
  });

  it('should register arguments via @Argument', () => {
    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      @Command('greet')
      greet(@Argument('name') _name: string) {}
    }

    const app = new MyApp().toCLI();
    const greet = app.commands.get('greet');
    expect(greet?.arguments).toHaveLength(1);
    expect(greet?.arguments[0].name).toBe('name');
    expect(greet?.arguments[0].required).toBe(true);
  });

  it('should register optional arguments when required: false', () => {
    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      @Command('greet')
      greet(@Argument('name', { required: false }) _name?: string) {}
    }

    const app = new MyApp().toCLI();
    const arg = app.commands.get('greet')?.arguments[0];
    expect(arg?.required).toBe(false);
  });

  it('should register options via @Option', () => {
    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      @Command('serve')
      serve(@Option('port', { alias: 'p', type: 'number', default: 3000 }) _port: number) {}
    }

    const app = new MyApp().toCLI();
    const serve = app.commands.get('serve');
    expect(serve?.options).toHaveLength(1);
    expect(serve?.options[0].name).toBe('port');
    expect(serve?.options[0].alias).toBe('p');
  });

  it('should bind parsed args/options to method parameters', async () => {
    let receivedName = '';
    let receivedPort = 0;

    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      @Command('serve')
      serve(
        @Argument('name') name: string,
        @Option('port', { type: 'number', default: 3000 }) port: number
      ) {
        receivedName = name;
        receivedPort = port as number;
      }
    }

    await new MyApp().runAsync(['serve', 'web', '--port', '8080']);
    expect(receivedName).toBe('web');
    expect(receivedPort).toBe(8080);
  });

  it('should preserve `this` binding in command methods', async () => {
    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      private prefix = 'Hello';

      @Command('greet')
      greet(@Argument('name') name: string) {
        console.log(`${this.prefix}, ${name}!`);
      }
    }

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await new MyApp().runAsync(['greet', 'World']);
    expect(logSpy).toHaveBeenCalledWith('Hello, World!');
  });

  it('should support multiple commands on one class', () => {
    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      @Command('build')
      build() {}

      @Command('test')
      test() {}

      @Command('deploy')
      deploy() {}
    }

    const app = new MyApp().toCLI();
    expect(app.commands.size).toBe(3);
  });

  it('should gather commands from the prototype chain (inheritance)', () => {
    abstract class Base extends CLIApplication {
      @Command('build')
      build() {}
    }

    @CLI({ name: 'child' })
    class Child extends Base {
      @Command('test')
      test() {}
    }

    const app = new Child().toCLI();
    expect(app.commands.has('build')).toBe(true);
    expect(app.commands.has('test')).toBe(true);
    expect(app.name).toBe('child');
  });

  it('should ignore @Argument used outside @Command (recorded, never merged)', () => {
    expect(() => {
      class Bad extends CLIApplication {
        // No @Command here — parameter metadata is recorded but never consumed
        method(@Argument('x') _x: string) {}
      }
      const app = new Bad().toCLI();
      expect(app.commands.size).toBe(0);
    }).not.toThrow();
  });

  it('should ignore @Option used outside @Command (recorded, never merged)', () => {
    expect(() => {
      class Bad extends CLIApplication {
        // No @Command here — parameter metadata is recorded but never consumed
        method(@Option('x') _x: string) {}
      }
      const app = new Bad().toCLI();
      expect(app.commands.size).toBe(0);
    }).not.toThrow();
  });

  it('should register plugins via the plugins() hook', () => {
    const install = vi.fn();
    const plugin = { name: 'p', version: '1.0.0', install };

    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      protected override plugins() {
        return [plugin];
      }

      @Command('x')
      x() {}
    }

    const app = new MyApp().toCLI();
    expect(install).toHaveBeenCalledTimes(1);
    expect(app.plugins.has('p')).toBe(true);
  });

  it('should execute async command methods', async () => {
    const done = vi.fn();

    @CLI({ name: 'myapp' })
    class MyApp extends CLIApplication {
      @Command('work')
      async work() {
        await new Promise((r) => setTimeout(r, 5));
        done();
      }
    }

    await new MyApp().runAsync(['work']);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('should fall back to class name when @CLI is missing', () => {
    class NamedApp extends CLIApplication {
      @Command('x')
      x() {}
    }

    const app = new NamedApp().toCLI();
    expect(app.name).toBe('NamedApp');
  });
});
