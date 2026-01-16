/**
 * Re-export Emitter from @oxog/emitter for users who want direct access
 */
export { Emitter, createEmitter } from '@oxog/emitter';
export type {
  EmitterOptions,
  EmitterInstance,
  EventMap,
  EventHandler,
  Handler,
  WildcardHandler,
  PatternHandler,
} from '@oxog/emitter';

/**
 * Event listener type
 * @deprecated Use Handler from @oxog/emitter instead
 */
export type EventListener = (...args: unknown[]) => void | Promise<void>;

/**
 * Event bus for inter-component communication
 *
 * @deprecated Use Emitter from @oxog/emitter instead
 * This class is kept for backward compatibility
 *
 * @example
 * ```typescript
 * // New recommended approach:
 * import { Emitter } from '@oxog/emitter';
 * const emitter = new Emitter<MyEvents>();
 *
 * // Legacy approach (deprecated):
 * const bus = new EventBus();
 *
 * bus.on('command:start', (data) => {
 *   console.log('Command started:', data);
 * });
 *
 * bus.emit('command:start', { name: 'build' });
 * ```
 */
export class EventBus {
  private listeners = new Map<string, Set<EventListener>>();
  private onceListeners = new Map<string, Set<EventListener>>();

  /**
   * Register an event listener
   *
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * const unsubscribe = bus.on('log', (message) => console.log(message));
   * // Later:
   * unsubscribe();
   * ```
   */
  on(event: string, handler: EventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Register a one-time event listener
   *
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * bus.once('init', () => console.log('Initialized!'));
   * bus.emit('init'); // Logs "Initialized!"
   * bus.emit('init'); // Does nothing
   * ```
   */
  once(event: string, handler: EventListener): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(handler);

    return () => this.off(event, handler);
  }

  /**
   * Unregister an event listener
   *
   * @param event - Event name (or undefined to remove all)
   * @param handler - Event handler function (or undefined to remove all for event)
   *
   * @example
   * ```typescript
   * bus.off('log', handler); // Remove specific handler
   * bus.off('log'); // Remove all handlers for 'log'
   * bus.off(); // Remove all handlers
   * ```
   */
  off(event?: string, handler?: EventListener): void {
    if (!event) {
      // Remove all listeners
      this.listeners.clear();
      this.onceListeners.clear();
      return;
    }

    if (!handler) {
      // Remove all listeners for event
      this.listeners.delete(event);
      this.onceListeners.delete(event);
      return;
    }

    // Remove specific handler
    this.listeners.get(event)?.delete(handler);
    this.onceListeners.get(event)?.delete(handler);
  }

  /**
   * Emit an event
   *
   * @param event - Event name
   * @param args - Arguments to pass to handlers
   * @returns Promise that resolves when all handlers complete
   *
   * @example
   * ```typescript
   * await bus.emit('command:start', { name: 'build' });
   * ```
   */
  async emit(event: string, ...args: unknown[]): Promise<void> {
    // Get regular listeners
    const regular = this.listeners.get(event);
    const once = this.onceListeners.get(event);

    // Collect all handlers
    const handlers: EventListener[] = [];
    if (regular) handlers.push(...Array.from(regular));
    if (once) handlers.push(...Array.from(once));

    // Execute handlers
    for (const handler of handlers) {
      await handler(...args);
    }

    // Remove once listeners
    if (once) {
      for (const handler of once) {
        this.off(event, handler);
      }
    }
  }

  /**
   * Get count of listeners for an event
   *
   * @param event - Event name
   * @returns Number of listeners
   *
   * @example
   * ```typescript
   * bus.listenerCount('log'); // 3
   * ```
   */
  listenerCount(event: string): number {
    const regular = this.listeners.get(event)?.size ?? 0;
    const once = this.onceListeners.get(event)?.size ?? 0;
    return regular + once;
  }

  /**
   * Get all event names with listeners
   *
   * @returns Array of event names
   *
   * @example
 * ```typescript
   * bus.eventNames(); // ['log', 'command:start', 'command:end']
   * ```
   */
  eventNames(): string[] {
    const names = new Set<string>();
    for (const event of this.listeners.keys()) names.add(event);
    for (const event of this.onceListeners.keys()) names.add(event);
    return Array.from(names);
  }

  /**
   * Remove all listeners
   *
   * @example
   * ```typescript
   * bus.removeAllListeners();
   * ```
   */
  removeAllListeners(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }
}
