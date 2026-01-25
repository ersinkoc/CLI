import type { CLIKernel, CLIPlugin, CLIContext, Unsubscribe } from './types.js';
import { Emitter } from '@oxog/emitter';

/**
 * Micro-kernel for CLI framework
 * Manages plugins, events, and configuration
 * Uses @oxog/emitter for event handling
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
  /**
   * @oxog/emitter instance for typed event handling
   * Configured with 'throw' error handling to propagate errors to callers
   */
  private emitter = new Emitter<Record<string, unknown>>({
    errorHandling: 'throw',
  });
  /**
   * Shared context object.
   * Starts as an empty CLIContext and is populated via setContextValue.
   * CLIContext is an index signature type (Record<string, unknown>) so empty object is valid.
   */
  private context: TContext = Object.create(null) as TContext;
  private initialized = false;

  /**
   * Register a plugin
   *
   * Plugins can be registered in any order. Dependencies are resolved
   * during initialize() rather than register(), allowing flexible registration.
   *
   * @param plugin - Plugin to register
   *
   * @example
   * ```typescript
   * // Plugins can be registered in any order
   * kernel.register(pluginB); // depends on pluginA
   * kernel.register(pluginA); // dependencies resolved at initialize()
   * kernel.register({
   *   name: 'my-plugin',
   *   version: '1.0.0',
   *   install: (kernel) => { ... }
   * });
   * ```
   */
  register(plugin: CLIPlugin<TContext>): void {
    // Check for existing plugin with same name
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // Install plugin (sets up event listeners)
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
   * Uses @oxog/emitter's emitAsync for async handler support
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
    await this.emitter.emitAsync(event, data);
  }

  /**
   * Register an event listener
   * Uses @oxog/emitter for typed event handling
   *
   * @param event - Event name
   * @param handler - Event handler (can be async)
   * @returns Unsubscribe function from @oxog/types
   *
   * @example
   * ```typescript
   * kernel.on('command:before', (ctx) => {
   *   console.log('Running:', ctx.command);
   * });
   * ```
   */
  on(event: string, handler: (data: unknown) => void | Promise<void>): Unsubscribe {
    return this.emitter.on(event, handler);
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
  off(event: string, handler?: (data: unknown) => void | Promise<void>): void {
    if (handler) {
      this.emitter.off(event, handler);
    } else {
      this.emitter.offAll(event);
    }
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
   * Validates dependencies and calls onInit in dependency order
   *
   * @throws Error if circular dependencies detected or missing dependencies
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

    // Validate and sort plugins by dependencies
    const sortedPlugins = this.resolveDependencies();

    // Call onInit in dependency order
    for (const plugin of sortedPlugins) {
      if (plugin.onInit) {
        await plugin.onInit(this.context);
      }
    }

    this.initialized = true;
  }

  /**
   * Resolve plugin dependencies using topological sort
   * Validates all dependencies exist and detects circular dependencies
   *
   * @returns Plugins sorted in dependency order (dependencies first)
   * @throws Error if dependencies are missing or circular
   */
  private resolveDependencies(): CLIPlugin<TContext>[] {
    const sorted: CLIPlugin<TContext>[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string, path: string[] = []): void => {
      if (visited.has(name)) {
        return;
      }

      if (visiting.has(name)) {
        throw new Error(
          `Circular dependency detected: ${[...path, name].join(' -> ')}`
        );
      }

      const plugin = this.plugins.get(name);
      if (!plugin) {
        throw new Error(
          `Plugin "${path[path.length - 1]}" depends on "${name}" which is not registered`
        );
      }

      visiting.add(name);

      // Visit dependencies first
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          visit(dep, [...path, name]);
        }
      }

      visiting.delete(name);
      visited.add(name);
      sorted.push(plugin);
    };

    // Visit all plugins
    for (const name of this.plugins.keys()) {
      visit(name);
    }

    return sorted;
  }

  /**
   * Reset the kernel (clear all plugins and context)
   * Primarily used for testing
   */
  reset(): void {
    this.plugins.clear();
    this.emitter.clear();
    this.context = Object.create(null) as TContext;
    this.initialized = false;
  }
}
