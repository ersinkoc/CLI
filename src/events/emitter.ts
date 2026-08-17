/**
 * Type-safe event emitter
 *
 * Zero-dependency implementation of a typed event emitter with:
 * - Typed events with full TypeScript support
 * - Wildcard patterns (`*`, `prefix:*`)
 * - Async emission with `emitAsync`
 * - Configurable error handling
 * - Memory leak detection (maxListeners)
 *
 * @example
 * ```typescript
 * interface MyEvents extends EventMap {
 *   'message': string;
 *   'user:login': { userId: string };
 * }
 *
 * const emitter = new Emitter<MyEvents>();
 *
 * emitter.on('message', (msg) => console.log(msg));
 * emitter.emit('message', 'Hello!');
 * ```
 */

/**
 * Event map interface - defines the shape of events.
 * Keys are event names, values are payload types.
 */
export type EventMap = Record<string, unknown>;

/**
 * Type that can be either sync or async.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Unsubscribe function type - call to remove subscription.
 */
export type Unsubscribe = () => void;

/**
 * Event handler function type.
 */
export type EventHandler<T = unknown> = (payload: T) => MaybePromise<unknown>;

/**
 * Handler for regular events.
 */
export type Handler<T> = (payload: T) => MaybePromise<unknown>;

/**
 * Handler for wildcard events (*).
 * Receives event name and payload.
 */
export type WildcardHandler = (eventName: string, payload: unknown) => MaybePromise<unknown>;

/**
 * Handler for pattern events (prefix:*).
 * Receives event name and payload.
 */
export type PatternHandler = (eventName: string, payload: unknown) => MaybePromise<unknown>;

/**
 * Error handling strategy.
 *
 * - `'emit'` - Emit errors as 'error' event (default)
 * - `'throw'` - Re-throw errors to caller
 * - `'silent'` - Silently ignore errors
 */
export type ErrorHandling = 'emit' | 'throw' | 'silent';

/**
 * Logger interface for debug mode.
 */
export interface EmitterLogger {
  log(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/**
 * Emitter configuration options.
 */
export interface EmitterOptions {
  /**
   * Error handling strategy.
   * @default 'emit'
   */
  errorHandling?: ErrorHandling;
  /**
   * Custom error handler. Overrides errorHandling strategy.
   */
  onError?: (error: Error, eventName: string) => void;
  /**
   * Maximum number of listeners per event before warning.
   * Set to 0 to disable warning.
   * @default 10
   */
  maxListeners?: number;
  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;
  /**
   * Custom logger for debug mode.
   */
  logger?: EmitterLogger;
}

/**
 * Emitter instance interface.
 * Defines all methods available on an emitter.
 */
export interface EmitterInstance<TEvents extends EventMap> {
  on<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): Unsubscribe;
  on(event: '*', handler: WildcardHandler): Unsubscribe;
  on(event: `${string}:*`, handler: PatternHandler): Unsubscribe;
  once<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): Unsubscribe;
  once(event: '*', handler: WildcardHandler): Unsubscribe;
  once(event: `${string}:*`, handler: PatternHandler): Unsubscribe;
  prependListener<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): Unsubscribe;
  prependOnceListener<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): Unsubscribe;
  off<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): void;
  off(event: '*', handler: WildcardHandler): void;
  off(event: `${string}:*`, handler: PatternHandler): void;
  offAll<K extends keyof TEvents>(event?: K): void;
  clear(): void;
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;
  emitAsync<K extends keyof TEvents>(event: K, payload: TEvents[K]): Promise<unknown[]>;
  listenerCount<K extends keyof TEvents>(event: K): number;
  listeners<K extends keyof TEvents>(event: K): Handler<TEvents[K]>[];
  eventNames(): (keyof TEvents | '*' | string)[];
  hasListeners<K extends keyof TEvents>(event: K): boolean;
  getMaxListeners(): number;
  setMaxListeners(n: number): this;
  isDebug(): boolean;
  setDebug(enabled: boolean): this;
}

/** Storage entry for a listener */
interface ListenerEntry {
  handler: (...args: unknown[]) => unknown;
  once: boolean;
}

/**
 * Implementation-signature handler type for overloaded subscribe/remove
 * methods. Intentionally permissive so every overload's handler shape
 * (exact, wildcard, pattern) is assignable to the single implementation.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- required for overload compatibility
type AnyHandler = (...args: any[]) => unknown;

const WILDCARD = '*';

/**
 * Type-safe event emitter class.
 *
 * @typeParam TEvents - The event map type
 *
 * @example Basic Usage
 * ```typescript
 * interface MyEvents {
 *   'message': string;
 *   'user:login': { userId: string };
 * }
 *
 * const emitter = new Emitter<MyEvents>();
 *
 * emitter.on('message', (msg) => console.log(msg));
 * emitter.emit('message', 'Hello!');
 * ```
 *
 * @example Wildcard
 * ```typescript
 * emitter.on('*', (eventName, payload) => {
 *   console.log(`Event: ${eventName}`, payload);
 * });
 * ```
 *
 * @example Pattern
 * ```typescript
 * emitter.on('user:*', (eventName, payload) => {
 *   console.log(`User event: ${eventName}`, payload);
 * });
 * ```
 */
export class Emitter<TEvents extends EventMap = EventMap> implements EmitterInstance<TEvents> {
  /** Handler storage: event name -> ordered listener list */
  private store = new Map<string, ListenerEntry[]>();

  /** Resolved options */
  private options: Required<Pick<EmitterOptions, 'errorHandling' | 'maxListeners' | 'debug'>> & {
    onError?: (error: Error, eventName: string) => void;
    logger: EmitterLogger;
  };

  /**
   * Create a new Emitter instance.
   *
   * @param options - Configuration options
   */
  constructor(options: EmitterOptions = {}) {
    this.options = {
      errorHandling: options.errorHandling ?? 'emit',
      maxListeners: options.maxListeners ?? 10,
      debug: options.debug ?? false,
      onError: options.onError,
      logger: options.logger ?? {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
      },
    };
  }

  /**
   * Subscribe to an event.
   *
   * @param event - Event name, `*` for all events, or `prefix:*` for pattern
   * @param handler - Handler function
   * @returns Unsubscribe function
   */
  on<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): Unsubscribe;
  on(event: '*', handler: WildcardHandler): Unsubscribe;
  on(event: `${string}:*`, handler: PatternHandler): Unsubscribe;
  on(event: string, handler: AnyHandler): Unsubscribe {
    this.validateEvent(event);
    this.validateHandler(handler);
    this.addListener(event as string, handler, { once: false, prepend: false });
    return () => this.off(event as string, handler);
  }

  /**
   * Subscribe to an event once.
   * Handler is automatically removed after first emission.
   *
   * @param event - Event name, `*` for all events, or `prefix:*` for pattern
   * @param handler - Handler function
   * @returns Unsubscribe function
   */
  once<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): Unsubscribe;
  once(event: '*', handler: WildcardHandler): Unsubscribe;
  once(event: `${string}:*`, handler: PatternHandler): Unsubscribe;
  once(event: string, handler: AnyHandler): Unsubscribe {
    this.validateEvent(event);
    this.validateHandler(handler);
    this.addListener(event as string, handler, { once: true, prepend: false });
    return () => this.off(event as string, handler);
  }

  /**
   * Add handler to the beginning of the listener queue.
   *
   * @param event - Event name
   * @param handler - Handler function
   * @returns Unsubscribe function
   */
  prependListener<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): Unsubscribe;
  prependListener(event: string, handler: AnyHandler): Unsubscribe {
    this.validateEvent(event);
    this.validateHandler(handler);
    this.addListener(event as string, handler, { once: false, prepend: true });
    return () => this.off(event as string, handler);
  }

  /**
   * Add once-handler to the beginning of the listener queue.
   *
   * @param event - Event name
   * @param handler - Handler function
   * @returns Unsubscribe function
   */
  prependOnceListener<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): Unsubscribe;
  prependOnceListener(event: string, handler: AnyHandler): Unsubscribe {
    this.validateEvent(event);
    this.validateHandler(handler);
    this.addListener(event as string, handler, { once: true, prepend: true });
    return () => this.off(event as string, handler);
  }

  /**
   * Remove a specific handler from an event.
   *
   * @param event - Event name
   * @param handler - Handler to remove
   */
  off<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): void;
  off(event: '*', handler: WildcardHandler): void;
  off(event: `${string}:*`, handler: PatternHandler): void;
  off(event: string, handler: AnyHandler): void {
    this.validateEvent(event);
    this.validateHandler(handler);
    const listeners = this.store.get(event as string);
    if (!listeners) return;

    const index = listeners.findIndex((entry) => entry.handler === handler);
    if (index !== -1) {
      listeners.splice(index, 1);
      if (listeners.length === 0) {
        this.store.delete(event as string);
      }
    }
  }

  /**
   * Remove all handlers for an event.
   *
   * @param event - Optional event name. If omitted, removes all handlers.
   */
  offAll<K extends keyof TEvents>(event?: K): void {
    if (event === undefined) {
      this.clear();
      return;
    }
    this.store.delete(event as string);
  }

  /**
   * Remove all handlers for all events.
   * Alias for `offAll()`.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Emit an event synchronously.
   * Does not wait for async handlers.
   *
   * @param event - Event name
   * @param payload - Event payload
   */
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    this.validateEvent(event);
    if (this.options.debug) {
      this.options.logger.log(`[Emitter] Emitting "${String(event)}"`);
    }

    const entries = this.collectEntries(event as string, payload);

    for (const { entry, eventName, args } of entries) {
      if (entry.once) {
        this.removeEntry(eventName, entry);
      }
      try {
        const result = entry.handler(...args);
        // Async handlers launched in background on sync emit
        if (result instanceof Promise) {
          result.catch((error) => this.handleEmitError(asError(error), String(event)));
        }
      } catch (error) {
        this.handleEmitError(asError(error), String(event));
      }
    }
  }

  /**
   * Emit an event and wait for all handlers to complete.
   *
   * @param event - Event name
   * @param payload - Event payload
   * @returns Promise resolving to array of handler results
   */
  async emitAsync<K extends keyof TEvents>(event: K, payload: TEvents[K]): Promise<unknown[]> {
    this.validateEvent(event);
    if (this.options.debug) {
      this.options.logger.log(`[Emitter] Emitting "${String(event)}" (async)`);
    }

    const entries = this.collectEntries(event as string, payload);
    const results: unknown[] = [];

    for (const { entry, eventName, args } of entries) {
      if (entry.once) {
        this.removeEntry(eventName, entry);
      }
      try {
        results.push(await entry.handler(...args));
      } catch (error) {
        this.handleEmitError(asError(error), String(event));
      }
    }

    return results;
  }

  /**
   * Get the number of listeners for an event.
   *
   * @param event - Event name
   */
  listenerCount<K extends keyof TEvents>(event: K): number {
    return this.store.get(event as string)?.length ?? 0;
  }

  /**
   * Get all listeners for an event.
   *
   * @param event - Event name
   */
  listeners<K extends keyof TEvents>(event: K): Handler<TEvents[K]>[] {
    const entries = this.store.get(event as string);
    if (!entries) return [];
    return entries.map((entry) => entry.handler as Handler<TEvents[K]>);
  }

  /**
   * Get all event names that have listeners.
   */
  eventNames(): (keyof TEvents | '*' | string)[] {
    return Array.from(this.store.keys());
  }

  /**
   * Check if an event has any listeners.
   *
   * @param event - Event name
   */
  hasListeners<K extends keyof TEvents>(event: K): boolean {
    return this.listenerCount(event) > 0;
  }

  /**
   * Get the current max listeners limit.
   */
  getMaxListeners(): number {
    return this.options.maxListeners;
  }

  /**
   * Set the max listeners limit.
   *
   * @param n - New limit (0 to disable warning)
   */
  setMaxListeners(n: number): this {
    this.options.maxListeners = n;
    return this;
  }

  /**
   * Check if debug mode is enabled.
   */
  isDebug(): boolean {
    return this.options.debug;
  }

  /**
   * Enable or disable debug mode.
   *
   * @param enabled - Whether to enable debug mode
   */
  setDebug(enabled: boolean): this {
    this.options.debug = enabled;
    return this;
  }

  // ── Internals ────────────────────────────────────────────────────────────

  /**
   * Add a listener entry to storage.
   */
  private addListener(
    event: string,
    handler: (...args: unknown[]) => unknown,
    opts: { once: boolean; prepend: boolean }
  ): void {
    let listeners = this.store.get(event);
    if (!listeners) {
      listeners = [];
      this.store.set(event, listeners);
    }

    const entry: ListenerEntry = { handler, once: opts.once };
    if (opts.prepend) {
      listeners.unshift(entry);
    } else {
      listeners.push(entry);
    }

    this.checkMaxListeners(event);
  }

  /**
   * Collect all listener entries matching an event:
   * exact match + wildcard `*` + matching `prefix:*` patterns.
   *
   * - Exact handlers receive `(payload)`
   * - Wildcard/pattern handlers receive `(eventName, payload)`
   */
  private collectEntries(
    event: string,
    payload: unknown
  ): Array<{ entry: ListenerEntry; eventName: string; args: unknown[] }> {
    const result: Array<{ entry: ListenerEntry; eventName: string; args: unknown[] }> = [];

    const exact = this.store.get(event);
    if (exact) {
      for (const entry of [...exact]) {
        result.push({ entry, eventName: event, args: [payload] });
      }
    }

    // Wildcard handlers receive (eventName, payload)
    const wildcard = this.store.get(WILDCARD);
    if (wildcard && event !== WILDCARD) {
      for (const entry of [...wildcard]) {
        result.push({ entry, eventName: WILDCARD, args: [event, payload] });
      }
    }

    // Pattern handlers (prefix:*) receive (eventName, payload)
    for (const [key, entries] of this.store) {
      if (key !== WILDCARD && key.endsWith(':*') && key.length > 2) {
        const prefix = key.slice(0, -1); // keep trailing ':'
        if (event.startsWith(prefix) && event !== key) {
          for (const entry of [...entries]) {
            result.push({ entry, eventName: key, args: [event, payload] });
          }
        }
      }
    }

    return result;
  }

  /**
   * Remove a specific entry from an event's listener list.
   */
  private removeEntry(event: string, entry: ListenerEntry): void {
    const listeners = this.store.get(event);
    if (!listeners) return;
    const index = listeners.indexOf(entry);
    if (index !== -1) {
      listeners.splice(index, 1);
      if (listeners.length === 0) {
        this.store.delete(event);
      }
    }
  }

  /**
   * Validate event name.
   * @throws Error if event is invalid
   */
  private validateEvent(event: unknown): void {
    if (typeof event !== 'string' || event.length === 0) {
      throw new Error(`Invalid event name: ${String(event)}`);
    }
  }

  /**
   * Validate handler function.
   * @throws Error if handler is invalid
   */
  private validateHandler(handler: unknown): void {
    if (typeof handler !== 'function') {
      throw new Error(`Invalid handler: ${typeof handler}`);
    }
  }

  /**
   * Check and warn if max listeners exceeded.
   */
  private checkMaxListeners(event: string): void {
    const max = this.options.maxListeners;
    if (max > 0) {
      const count = this.store.get(event)?.length ?? 0;
      if (count > max) {
        this.options.logger.warn(
          `[Emitter] Possible memory leak: ${count} listeners for "${event}" (limit: ${max})`
        );
      }
    }
  }

  /**
   * Handle errors during emission.
   */
  private handleEmitError(error: Error, eventName: string): void {
    if (this.options.onError) {
      this.options.onError(error, eventName);
      return;
    }

    switch (this.options.errorHandling) {
      case 'throw':
        throw error;
      case 'silent':
        return;
      case 'emit':
      default: {
        // Emit as 'error' event unless the error event itself failed
        if (eventName === 'error') {
          this.options.logger.error('[Emitter] Unhandled error event:', error);
          return;
        }
        const errorListeners = this.store.get('error');
        if (errorListeners && errorListeners.length > 0) {
          try {
            for (const entry of [...errorListeners]) {
              if (entry.once) {
                this.removeEntry('error', entry);
              }
              entry.handler(error);
            }
          } catch (nested) {
            this.options.logger.error('[Emitter] Error in error handler:', nested);
          }
        } else {
          this.options.logger.error('[Emitter] Unhandled error:', error);
        }
        break;
      }
    }
  }
}

/**
 * Normalize a caught value into an Error instance.
 */
function asError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(String(value));
}

/**
 * Create a new typed event emitter.
 * Factory function alternative to `new Emitter()`.
 *
 * @typeParam TEvents - The event map type
 * @param options - Configuration options
 * @returns Emitter instance
 *
 * @example
 * ```typescript
 * interface MyEvents {
 *   'message': string;
 *   'error': Error;
 * }
 *
 * const emitter = createEmitter<MyEvents>();
 * emitter.on('message', (msg) => console.log(msg));
 * emitter.emit('message', 'Hello!');
 * ```
 */
export function createEmitter<TEvents extends EventMap = EventMap>(
  options?: EmitterOptions
): Emitter<TEvents> {
  return new Emitter<TEvents>(options);
}
