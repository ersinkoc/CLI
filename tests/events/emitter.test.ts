/**
 * Vendored Emitter tests
 * Covers the full zero-dependency emitter surface:
 * on/once/prepend, wildcard + pattern, sync/async emit,
 * error strategies, validation, max-listeners, debug logging.
 */

import { describe, it, expect, vi } from 'vitest';
import { Emitter, createEmitter } from '../../src/events/emitter.js';
import type { EmitterLogger, EventMap } from '../../src/events/emitter.js';

interface TestEvents extends EventMap {
  message: string;
  count: number;
  error: Error;
  'user:login': { userId: string };
}

function makeLogger(): EmitterLogger & {
  logs: string[];
  warns: string[];
  errors: string[];
} {
  const logs: string[] = [];
  const warns: string[] = [];
  const errors: string[] = [];
  return {
    logs,
    warns,
    errors,
    log: (m, ...rest) => logs.push([m, ...rest.map(String)].join(' ')),
    warn: (m, ...rest) => warns.push([m, ...rest.map(String)].join(' ')),
    error: (m, ...rest) => errors.push([m, ...rest.map(String)].join(' ')),
  };
}

describe('Emitter', () => {
  describe('basic on/emit', () => {
    it('should deliver payload to handler', () => {
      const emitter = new Emitter<TestEvents>();
      const received: string[] = [];
      emitter.on('message', (msg) => {
        received.push(msg);
      });
      emitter.emit('message', 'hello');
      expect(received).toEqual(['hello']);
    });

    it('should call multiple handlers in registration order', () => {
      const emitter = new Emitter<TestEvents>();
      const order: string[] = [];
      emitter.on('message', () => order.push('first'));
      emitter.on('message', () => order.push('second'));
      emitter.emit('message', 'x');
      expect(order).toEqual(['first', 'second']);
    });

    it('should not deliver to handlers of other events', () => {
      const emitter = new Emitter<TestEvents>();
      const received: string[] = [];
      emitter.on('message', (msg) => received.push(msg));
      emitter.emit('count', 1);
      expect(received).toEqual([]);
    });

    it('should return an unsubscribe function from on()', () => {
      const emitter = new Emitter<TestEvents>();
      const received: string[] = [];
      const unsubscribe = emitter.on('message', (msg) => received.push(msg));
      unsubscribe();
      emitter.emit('message', 'nope');
      expect(received).toEqual([]);
    });
  });

  describe('once', () => {
    it('should fire handler exactly once', () => {
      const emitter = new Emitter<TestEvents>();
      let calls = 0;
      emitter.once('message', () => {
        calls++;
      });
      emitter.emit('message', 'a');
      emitter.emit('message', 'b');
      expect(calls).toBe(1);
    });

    it('should not block other once handlers on same event', () => {
      const emitter = new Emitter<TestEvents>();
      let a = 0;
      let b = 0;
      emitter.once('message', () => a++);
      emitter.once('message', () => b++);
      emitter.emit('message', 'x');
      expect(a).toBe(1);
      expect(b).toBe(1);
      emitter.emit('message', 'y');
      expect(a).toBe(1);
      expect(b).toBe(1);
    });

    it('should support unsubscribe before first emission', () => {
      const emitter = new Emitter<TestEvents>();
      let calls = 0;
      const unsubscribe = emitter.once('message', () => calls++);
      unsubscribe();
      emitter.emit('message', 'x');
      expect(calls).toBe(0);
    });

    it('should work with emitAsync', async () => {
      const emitter = new Emitter<TestEvents>();
      let calls = 0;
      emitter.once('message', () => {
        calls++;
      });
      await emitter.emitAsync('message', 'a');
      await emitter.emitAsync('message', 'b');
      expect(calls).toBe(1);
    });
  });

  describe('prependListener / prependOnceListener', () => {
    it('should run prepended handler first', () => {
      const emitter = new Emitter<TestEvents>();
      const order: string[] = [];
      emitter.on('message', () => order.push('regular'));
      emitter.prependListener('message', () => order.push('prepended'));
      emitter.emit('message', 'x');
      expect(order).toEqual(['prepended', 'regular']);
    });

    it('should run prependOnceListener first and only once', () => {
      const emitter = new Emitter<TestEvents>();
      const order: string[] = [];
      emitter.on('message', () => order.push('regular'));
      emitter.prependOnceListener('message', () => order.push('once'));
      emitter.emit('message', 'a');
      emitter.emit('message', 'b');
      expect(order).toEqual(['once', 'regular', 'regular']);
    });

    it('should support unsubscribe from prepended handlers', () => {
      const emitter = new Emitter<TestEvents>();
      const order: string[] = [];
      const unsubscribe = emitter.prependListener('message', () => order.push('first'));
      emitter.on('message', () => order.push('second'));
      unsubscribe();
      emitter.emit('message', 'x');
      expect(order).toEqual(['second']);
    });
  });

  describe('off / offAll / clear', () => {
    it('should remove a specific handler', () => {
      const emitter = new Emitter<TestEvents>();
      const received: string[] = [];
      const handler = (msg: string) => received.push(msg);
      emitter.on('message', handler);
      emitter.off('message', handler);
      emitter.emit('message', 'x');
      expect(received).toEqual([]);
    });

    it('should be a no-op for an unknown event', () => {
      const emitter = new Emitter<TestEvents>();
      expect(() => emitter.off('message', () => {})).not.toThrow();
    });

    it('should be a no-op when handler is not registered', () => {
      const emitter = new Emitter<TestEvents>();
      let calls = 0;
      emitter.on('message', () => calls++);
      emitter.off('message', () => calls++); // different reference
      emitter.emit('message', 'x');
      expect(calls).toBe(1);
    });

    it('should clean up empty event key from store', () => {
      const emitter = new Emitter<TestEvents>();
      const handler = () => {};
      emitter.on('message', handler);
      emitter.off('message', handler);
      expect(emitter.eventNames()).toEqual([]);
    });

    it('offAll(event) should remove all handlers for that event only', () => {
      const emitter = new Emitter<TestEvents>();
      let messages = 0;
      let counts = 0;
      emitter.on('message', () => messages++);
      emitter.on('message', () => messages++);
      emitter.on('count', () => counts++);
      emitter.offAll('message');
      emitter.emit('message', 'x');
      emitter.emit('count', 1);
      expect(messages).toBe(0);
      expect(counts).toBe(1);
    });

    it('offAll() with no argument should remove everything', () => {
      const emitter = new Emitter<TestEvents>();
      let calls = 0;
      emitter.on('message', () => calls++);
      emitter.on('count', () => calls++);
      emitter.offAll();
      emitter.emit('message', 'x');
      emitter.emit('count', 1);
      expect(calls).toBe(0);
    });

    it('clear() should behave like offAll()', () => {
      const emitter = new Emitter<TestEvents>();
      let calls = 0;
      emitter.on('message', () => calls++);
      emitter.clear();
      emitter.emit('message', 'x');
      expect(calls).toBe(0);
      expect(emitter.eventNames()).toEqual([]);
    });
  });

  describe('wildcard (*)', () => {
    it('should receive every event with name and payload', () => {
      const emitter = new Emitter<TestEvents>();
      const seen: Array<[string, unknown]> = [];
      emitter.on('*', (eventName, payload) => {
        seen.push([eventName, payload]);
      });
      emitter.emit('message', 'hi');
      emitter.emit('count', 5);
      expect(seen).toEqual([
        ['message', 'hi'],
        ['count', 5],
      ]);
    });

    it('should fire wildcard handlers exactly once when "*" itself is emitted', () => {
      const emitter = new Emitter<TestEvents>();
      let wildcardCalls = 0;
      emitter.on('*', () => wildcardCalls++);
      emitter.on('*', () => wildcardCalls++);
      emitter.emit('*', 'boom');
      // Each handler fires once (as exact match), NOT twice (exact + wildcard)
      expect(wildcardCalls).toBe(2);
    });

    it('should support unsubscribing wildcard handlers', () => {
      const emitter = new Emitter<TestEvents>();
      let calls = 0;
      const handler = () => calls++;
      emitter.on('*', handler);
      emitter.off('*', handler);
      emitter.emit('message', 'x');
      expect(calls).toBe(0);
    });
  });

  describe('pattern (prefix:*)', () => {
    it('should receive events sharing the prefix', () => {
      const emitter = new Emitter<TestEvents>();
      const seen: Array<[string, unknown]> = [];
      emitter.on('user:*', (eventName, payload) => {
        seen.push([eventName, payload]);
      });
      emitter.emit('user:login', { userId: '42' });
      expect(seen).toEqual([['user:login', { userId: '42' }]]);
    });

    it('should ignore events with a different prefix', () => {
      const emitter = new Emitter<TestEvents>();
      let calls = 0;
      emitter.on('user:*', () => calls++);
      emitter.emit('message', 'x');
      emitter.emit('order:created', {});
      expect(calls).toBe(0);
    });

    it('should ignore a bare ":*" pattern key (length guard)', () => {
      const emitter = new Emitter<TestEvents>();
      // ':*' has length 2 and is skipped by the key.length > 2 guard
      let calls = 0;
      emitter.on(':*' as `${string}:*`, () => calls++);
      emitter.emit('anything', 1);
      expect(calls).toBe(0);
    });

    it('should fire alongside exact handlers', () => {
      const emitter = new Emitter<TestEvents>();
      const order: string[] = [];
      emitter.on('user:login', () => order.push('exact'));
      emitter.on('user:*', () => order.push('pattern'));
      emitter.emit('user:login', { userId: '1' });
      expect(order).toEqual(['exact', 'pattern']);
    });
  });

  describe('validation', () => {
    it('should throw on empty event name in on()', () => {
      const emitter = new Emitter<TestEvents>();
      expect(() => emitter.on('' as keyof TestEvents, () => {})).toThrow('Invalid event name');
    });

    it('should throw on non-string event name in once()', () => {
      const emitter = new Emitter<TestEvents>();
      expect(() => emitter.on(123 as unknown as keyof TestEvents, () => {})).toThrow(
        'Invalid event name'
      );
    });

    it('should throw on non-function handler in on()', () => {
      const emitter = new Emitter<TestEvents>();
      expect(() => emitter.on('message', 'nope' as unknown as () => void)).toThrow(
        'Invalid handler'
      );
    });

    it('should throw on non-function handler in off()', () => {
      const emitter = new Emitter<TestEvents>();
      expect(() => emitter.off('message', undefined as unknown as () => void)).toThrow(
        'Invalid handler'
      );
    });

    it('should throw on empty event name in emit()', () => {
      const emitter = new Emitter<TestEvents>();
      expect(() => emitter.emit('' as keyof TestEvents, 'x')).toThrow('Invalid event name');
    });

    it('should throw on empty event name in emitAsync()', async () => {
      const emitter = new Emitter<TestEvents>();
      await expect(emitter.emitAsync('' as keyof TestEvents, 'x')).rejects.toThrow(
        'Invalid event name'
      );
    });

    it('should throw on invalid handler in prependListener()', () => {
      const emitter = new Emitter<TestEvents>();
      expect(() =>
        emitter.prependListener('message', null as unknown as () => void)
      ).toThrow('Invalid handler');
    });

    it('should throw on invalid event in prependOnceListener()', () => {
      const emitter = new Emitter<TestEvents>();
      expect(() =>
        emitter.prependOnceListener('' as keyof TestEvents, () => {})
      ).toThrow('Invalid event name');
    });
  });

  describe('sync emit error handling', () => {
    it("strategy 'throw' should propagate handler errors", () => {
      const emitter = new Emitter<TestEvents>({ errorHandling: 'throw' });
      emitter.on('message', () => {
        throw new Error('boom');
      });
      expect(() => emitter.emit('message', 'x')).toThrow('boom');
    });

    it("strategy 'silent' should swallow handler errors", () => {
      const emitter = new Emitter<TestEvents>({ errorHandling: 'silent' });
      let after = 0;
      emitter.on('message', () => {
        throw new Error('boom');
      });
      emitter.on('message', () => after++);
      expect(() => emitter.emit('message', 'x')).not.toThrow();
      expect(after).toBe(1);
    });

    it("strategy 'emit' should route errors to error listeners", () => {
      const emitter = new Emitter<TestEvents>();
      const errors: unknown[] = [];
      emitter.on('message', () => {
        throw new Error('boom');
      });
      emitter.on('error', (err) => errors.push(err));
      emitter.emit('message', 'x');
      expect(errors).toHaveLength(1);
      expect((errors[0] as Error).message).toBe('boom');
    });

    it("strategy 'emit' should remove once-style error listeners after use", () => {
      const emitter = new Emitter<TestEvents>();
      let errorCalls = 0;
      emitter.on('message', () => {
        throw new Error('a');
      });
      emitter.once('error', () => errorCalls++);
      emitter.emit('message', 'x');
      emitter.emit('message', 'y');
      expect(errorCalls).toBe(1);
    });

    it("strategy 'emit' with no error listeners should log unhandled", () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger });
      emitter.on('message', () => {
        throw new Error('boom');
      });
      emitter.emit('message', 'x');
      expect(logger.errors.join(' ')).toContain('Unhandled error');
    });

    it("failing emit on 'error' itself should log, not recurse", () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger });
      emitter.on('error', () => {
        throw new Error('error-handler-crash');
      });
      emitter.emit('error', new Error('original'));
      expect(logger.errors.join(' ')).toContain('Unhandled error event');
    });

    it('nested error-handler crash should be caught and logged', () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger });
      emitter.on('message', () => {
        throw new Error('original');
      });
      emitter.on('error', () => {
        throw new Error('crash-in-error-handler');
      });
      emitter.emit('message', 'x');
      expect(logger.errors.join(' ')).toContain('Error in error handler');
    });

    it('onError callback should take precedence over strategies', () => {
      const seen: Array<[string, string]> = [];
      const emitter = new Emitter<TestEvents>({
        errorHandling: 'silent',
        onError: (error, eventName) => seen.push([eventName, error.message]),
      });
      emitter.on('message', () => {
        throw new Error('boom');
      });
      emitter.emit('message', 'x');
      expect(seen).toEqual([['message', 'boom']]);
    });

    it('non-Error throwables should be normalized to Errors', () => {
      const emitter = new Emitter<TestEvents>({ errorHandling: 'throw' });
      emitter.on('message', () => {
        throw 'plain string failure';
      });
      expect(() => emitter.emit('message', 'x')).toThrow('plain string failure');
    });

    it('rejected async handler on sync emit should reach error listeners', async () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger });
      emitter.on('message', async () => {
        throw new Error('async boom');
      });
      emitter.emit('message', 'x');
      // Let the rejected promise microtask run
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(logger.errors.join(' ')).toContain('Unhandled error');
    });
  });

  describe('emitAsync', () => {
    it('should await async handlers and collect results', async () => {
      const emitter = new Emitter<TestEvents>();
      emitter.on('message', async (msg) => msg.toUpperCase());
      emitter.on('message', () => 42);
      const results = await emitter.emitAsync('message', 'hi');
      expect(results).toEqual(['HI', 42]);
    });

    it('should continue after a failing handler under default strategy', async () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger });
      let after = 0;
      emitter.on('message', () => {
        throw new Error('boom');
      });
      emitter.on('message', () => {
        after++;
      });
      const results = await emitter.emitAsync('message', 'x');
      expect(after).toBe(1);
      expect(results).toEqual([undefined]);
      expect(logger.errors.join(' ')).toContain('Unhandled error');
    });

    it('should propagate errors under throw strategy', async () => {
      const emitter = new Emitter<TestEvents>({ errorHandling: 'throw' });
      emitter.on('message', () => {
        throw new Error('boom');
      });
      await expect(emitter.emitAsync('message', 'x')).rejects.toThrow('boom');
    });

    it('should invoke wildcard handlers during async emit', async () => {
      const emitter = new Emitter<TestEvents>();
      const seen: Array<[string, unknown]> = [];
      emitter.on('*', (eventName, payload) => {
        seen.push([eventName, payload]);
        return 'wild';
      });
      const results = await emitter.emitAsync('message', 'hi');
      expect(seen).toEqual([['message', 'hi']]);
      expect(results).toEqual(['wild']);
    });
  });

  describe('introspection', () => {
    it('listenerCount should reflect registrations', () => {
      const emitter = new Emitter<TestEvents>();
      expect(emitter.listenerCount('message')).toBe(0);
      emitter.on('message', () => {});
      emitter.on('message', () => {});
      expect(emitter.listenerCount('message')).toBe(2);
    });

    it('listeners should return registered handler references', () => {
      const emitter = new Emitter<TestEvents>();
      const a = () => {};
      const b = () => {};
      emitter.on('message', a);
      emitter.on('message', b);
      expect(emitter.listeners('message')).toEqual([a, b]);
    });

    it('listeners should return empty array for unknown event', () => {
      const emitter = new Emitter<TestEvents>();
      expect(emitter.listeners('message')).toEqual([]);
    });

    it('eventNames should list keys with listeners', () => {
      const emitter = new Emitter<TestEvents>();
      emitter.on('message', () => {});
      emitter.on('count', () => {});
      expect(emitter.eventNames().sort()).toEqual(['count', 'message']);
    });

    it('hasListeners should reflect presence', () => {
      const emitter = new Emitter<TestEvents>();
      expect(emitter.hasListeners('message')).toBe(false);
      emitter.on('message', () => {});
      expect(emitter.hasListeners('message')).toBe(true);
    });
  });

  describe('maxListeners', () => {
    it('should warn when exceeding the default limit', () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger });
      for (let i = 0; i < 11; i++) {
        emitter.on('message', () => {});
      }
      expect(logger.warns.join(' ')).toContain('Possible memory leak');
      expect(logger.warns.join(' ')).toContain('11 listeners');
    });

    it('should not warn at or below the limit', () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger });
      for (let i = 0; i < 10; i++) {
        emitter.on('message', () => {});
      }
      expect(logger.warns).toEqual([]);
    });

    it('should honor a custom limit', () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger, maxListeners: 2 });
      emitter.on('message', () => {});
      emitter.on('message', () => {});
      emitter.on('message', () => {});
      expect(logger.warns).toHaveLength(1);
    });

    it('should disable the warning with 0', () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger, maxListeners: 0 });
      for (let i = 0; i < 50; i++) {
        emitter.on('message', () => {});
      }
      expect(logger.warns).toEqual([]);
    });

    it('should support setMaxListeners/getMaxListeners', () => {
      const emitter = new Emitter<TestEvents>();
      expect(emitter.getMaxListeners()).toBe(10);
      const returned = emitter.setMaxListeners(3);
      expect(returned).toBe(emitter);
      expect(emitter.getMaxListeners()).toBe(3);
    });
  });

  describe('debug mode', () => {
    it('should be disabled by default', () => {
      const emitter = new Emitter<TestEvents>();
      expect(emitter.isDebug()).toBe(false);
    });

    it('should log emissions when enabled via constructor', () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ debug: true, logger });
      emitter.emit('message', 'x');
      expect(logger.logs.join(' ')).toContain('[Emitter] Emitting "message"');
    });

    it('should log async emissions when enabled', async () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ debug: true, logger });
      await emitter.emitAsync('message', 'x');
      expect(logger.logs.join(' ')).toContain('(async)');
    });

    it('should toggle via setDebug', () => {
      const logger = makeLogger();
      const emitter = new Emitter<TestEvents>({ logger });
      const returned = emitter.setDebug(true);
      expect(returned).toBe(emitter);
      expect(emitter.isDebug()).toBe(true);
      emitter.emit('message', 'x');
      expect(logger.logs).toHaveLength(1);
      emitter.setDebug(false);
      emitter.emit('message', 'y');
      expect(logger.logs).toHaveLength(1);
    });
  });

  describe('createEmitter factory', () => {
    it('should create a working emitter', () => {
      const emitter = createEmitter<TestEvents>();
      const received: string[] = [];
      emitter.on('message', (msg) => received.push(msg));
      emitter.emit('message', 'factory');
      expect(received).toEqual(['factory']);
    });

    it('should forward options', () => {
      const logger = makeLogger();
      const emitter = createEmitter<TestEvents>({ debug: true, logger });
      emitter.emit('message', 'x');
      expect(logger.logs.join(' ')).toContain('Emitting');
    });
  });
});

describe('Emitter default logger', () => {
  it('should fall back to console when no logger is provided', () => {
    // Spy BEFORE constructing: the default logger binds console methods at construction
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const emitter = new Emitter<TestEvents>();
    try {
      emitter.on('message', () => {
        throw new Error('boom');
      });
      emitter.emit('message', 'x'); // unhandled -> console.error
      emitter.setDebug(true);
      emitter.emit('count', 1); // debug log
      for (let i = 0; i < 11; i++) emitter.on('count', () => {});
      emitter.emit('count', 2); // leak warning

      // Assert BEFORE mockRestore(): restoring clears call history
      expect(errorSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      logSpy.mockRestore();
    }
  });
});
