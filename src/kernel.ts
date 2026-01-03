import type { CLIKernel, CLIPlugin, CLIContext } from './types.js';
import { EventBus } from './events/index.js';

/**
 * Micro-kernel for CLI framework
 * Manages plugins, events, and configuration
 *
 * @example
 * ```typescript
 * const kernel = new CLIKernelImpl();
 * kernel.register(myPlugin);
 * kernel.emit('init', { app: cli });
 * ```
 */
export class CLIKernelImpl<TContext extends CLIContext = CLIContext> implements CLIKernel<TContext> {
  private plugins = new Map<string, CLIPlugin<TContext>>();
  private eventBus = new EventBus();
  private context: TContext = {} as TContext;
  private initialized = false;

  /**
   * Register a plugin
   *
   * @param plugin - Plugin to register
   *
   * @example
   * ```typescript
   * kernel.register({
   *   name: 'my-plugin',
   *   version: '1.0.0',
   *   install: (kernel) => { ... }
   * });
   * ```
   */
  register(plugin: CLIPlugin<TContext>): void {
    // Check for dependency conflicts
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `Plugin "${plugin.name}" depends on "${dep}" which is not registered`
          );
        }
      }
    }

    // Check for existing plugin with same name
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // Install plugin
    try {
      plugin.install(this);
      this.plugins.set(plugin.name, plugin);
    } catch (error) {
      if (plugin.onError) {
        plugin.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Unregister a plugin by name
   *
   * @param name - Plugin name to unregister
   *
   * @example
   * ```typescript
   * kernel.unregister('my-plugin');
   * ```
   */
  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return;
    }

    // Call onDestroy if present
    if (plugin.onDestroy) {
      try {
        plugin.onDestroy();
      } catch (error) {
        if (plugin.onError) {
          plugin.onError(error as Error);
        }
      }
    }

    this.plugins.delete(name);
  }

  /**
   * List all registered plugins
   *
   * @returns Array of plugins
   *
   * @example
   * ```typescript
   * const plugins = kernel.list();
   * ```
   */
  list(): CLIPlugin<TContext>[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if a plugin is registered
   *
   * @param name - Plugin name
   * @returns true if plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get a plugin by name
   *
   * @param name - Plugin name
   * @returns Plugin or undefined
   */
  get(name: string): CLIPlugin<TContext> | undefined {
    return this.plugins.get(name);
  }

  /**
   * Emit an event
   *
   * @param event - Event name
   * @param data - Event data
   *
   * @example
   * ```typescript
   * await kernel.emit('command:before', { name: 'build' });
   * ```
   */
  async emit(event: string, data: unknown): Promise<void> {
    await this.eventBus.emit(event, data);
  }

  /**
   * Register an event listener
   *
   * @param event - Event name
   * @param handler - Event handler (can be async)
   * @returns Unsubscribe function
   *
   * @example
   * ```typescript
   * kernel.on('command:before', (ctx) => {
   *   console.log('Running:', ctx.command);
   * });
   * ```
   */
  on(event: string, handler: (...args: unknown[]) => void | Promise<void>): () => void {
    return this.eventBus.on(event, handler);
  }

  /**
   * Unregister an event listener
   *
   * @param event - Event name
   * @param handler - Event handler (optional)
   *
   * @example
   * ```typescript
   * kernel.off('command:before', handler);
   * ```
   */
  off(event: string, handler?: (...args: unknown[]) => void | Promise<void>): void {
    this.eventBus.off(event, handler);
  }

  /**
   * Get shared context
   *
   * @returns Context object
   *
   * @example
   * ```typescript
   * const ctx = kernel.getContext();
   * ```
   */
  getContext(): Readonly<TContext> {
    return this.context;
  }

  /**
   * Set context value
   *
   * @param key - Context key
   * @param value - Context value
   */
  setContextValue<K extends keyof TContext>(key: K, value: TContext[K]): void {
    this.context[key] = value;
  }

  /**
   * Initialize all plugins
   * Calls onInit for each plugin
   *
   * @example
   * ```typescript
   * await kernel.initialize();
   * ```
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    for (const plugin of this.plugins.values()) {
      if (plugin.onInit) {
        await plugin.onInit(this.context);
      }
    }

    this.initialized = true;
  }

  /**
   * Reset the kernel (clear all plugins and context)
   * Primarily used for testing
   */
  reset(): void {
    this.plugins.clear();
    this.eventBus.removeAllListeners();
    this.context = {} as TContext;
    this.initialized = false;
  }
}
