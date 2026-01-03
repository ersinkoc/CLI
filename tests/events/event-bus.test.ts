/**
 * Event Bus tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../src/events/index.js';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('should create event bus', () => {
    expect(bus).toBeDefined();
  });

  it('should register event listener', async () => {
    let called = false;
    bus.on('test', () => {
      called = true;
    });
    await bus.emit('test', null);
    expect(called).toBe(true);
  });

  it('should pass data to listeners', async () => {
    let received: any;
    bus.on('test', (...args: unknown[]) => {
      received = args[0];
    });
    await bus.emit('test', { value: 42 });
    expect(received.value).toBe(42);
  });

  it('should support multiple listeners', async () => {
    let count = 0;
    bus.on('test', () => count++);
    bus.on('test', () => count++);
    await bus.emit('test', null);
    expect(count).toBe(2);
  });

  it('should return unsubscribe function', async () => {
    let count = 0;
    const unsubscribe = bus.on('test', () => count++);
    await bus.emit('test', null);
    unsubscribe();
    await bus.emit('test', null);
    expect(count).toBe(1);
  });

  it('should remove specific listener', async () => {
    let count1 = 0;
    let count2 = 0;
    const handler1 = () => count1++;
    const handler2 = () => count2++;
    bus.on('test', handler1);
    bus.on('test', handler2);
    bus.off('test', handler1);
    await bus.emit('test', null);
    expect(count1).toBe(0);
    expect(count2).toBe(1);
  });

  it('should remove all listeners', async () => {
    let count = 0;
    bus.on('test', () => count++);
    bus.on('test', () => count++);
    bus.removeAllListeners();
    await bus.emit('test', null);
    expect(count).toBe(0);
  });

  it('should handle async handlers', async () => {
    let result = '';
    bus.on('test', async (...args: unknown[]) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      result = 'done';
    });
    await bus.emit('test', null);
    expect(result).toBe('done');
  });

  it('should handle events with no listeners', async () => {
    await expect(bus.emit('nonexistent', null)).resolves.not.toThrow();
  });

  it('should support once-style listeners', async () => {
    let count = 0;
    const unsubscribe = bus.on('test', () => count++);
    await bus.emit('test', null);
    unsubscribe();
    await bus.emit('test', null);
    expect(count).toBe(1);
  });

  it('should get listener count for event', () => {
    bus.on('test', () => {});
    bus.on('test', () => {});
    bus.on('other', () => {});
    expect(bus.listenerCount('test')).toBe(2);
    expect(bus.listenerCount('other')).toBe(1);
    expect(bus.listenerCount('nonexistent')).toBe(0);
  });

  it('should get all event names', () => {
    bus.on('event1', () => {});
    bus.on('event2', () => {});
    bus.on('event3', () => {});
    const names = bus.eventNames();
    expect(names).toContain('event1');
    expect(names).toContain('event2');
    expect(names).toContain('event3');
    expect(names).toHaveLength(3);
  });

  it('should handle once listeners correctly', async () => {
    let count = 0;
    bus.once('test', () => count++);
    await bus.emit('test', null);
    await bus.emit('test', null);
    expect(count).toBe(1);
  });

  it('should include once listeners in count', () => {
    bus.on('test', () => {});
    bus.once('test', () => {});
    expect(bus.listenerCount('test')).toBe(2);
  });

  it('should remove once listeners with unsubscribe', async () => {
    let count = 0;
    const unsubscribe = bus.once('test', () => count++);
    unsubscribe();
    await bus.emit('test', null);
    expect(count).toBe(0);
  });

  it('should remove all listeners for specific event', () => {
    bus.on('test', () => {});
    bus.on('test', () => {});
    bus.on('other', () => {});
    bus.off('test');
    expect(bus.listenerCount('test')).toBe(0);
    expect(bus.listenerCount('other')).toBe(1);
  });

  it('should remove all listeners when off called with no arguments', () => {
    bus.on('test', () => {});
    bus.on('other', () => {});
    bus.once('once-test', () => {});

    expect(bus.listenerCount('test')).toBe(1);
    expect(bus.listenerCount('other')).toBe(1);
    expect(bus.listenerCount('once-test')).toBe(1);

    // Call off with no arguments to remove all listeners
    bus.off();

    expect(bus.listenerCount('test')).toBe(0);
    expect(bus.listenerCount('other')).toBe(0);
    expect(bus.listenerCount('once-test')).toBe(0);
  });
});
