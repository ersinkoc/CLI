import { Command } from './command.js';
import { findBestMatch } from '../utils/levenshtein.js';

/**
 * Command registry for managing commands
 *
 * @example
 * ```typescript
 * const registry = new CommandRegistry();
 * const buildCmd = new Command('build');
 * registry.register(buildCmd);
 *
 * const cmd = registry.get('build');
 * ```
 */
export class CommandRegistry {
  private commands = new Map<string, Command>();

  /**
   * Register a command
   *
   * @param command - Command to register
   *
   * @example
   * ```typescript
   * const registry = new CommandRegistry();
   * registry.register(new Command('build'));
   * ```
   */
  register(command: Command): void {
    this.commands.set(command.name, command);
  }

  /**
   * Unregister a command by name
   *
   * @param name - Command name to unregister
   * @returns true if command was found and removed
   *
   * @example
   * ```typescript
   * registry.unregister('build');
   * ```
   */
  unregister(name: string): boolean {
    return this.commands.delete(name);
  }

  /**
   * Get a command by name
   *
   * @param name - Command name
   * @returns Command or undefined
   *
   * @example
   * ```typescript
   * const cmd = registry.get('build');
   * ```
   */
  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Check if a command exists
   *
   * @param name - Command name
   * @returns true if command exists
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Get all registered commands
   *
   * @returns Array of commands
   *
   * @example
   * ```typescript
   * const all = registry.list();
   * ```
   */
  list(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get all command names
   *
   * @returns Array of command names
   *
   * @example
   * ```typescript
   * const names = registry.names(); // ['build', 'test', 'deploy']
   * ```
   */
  names(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Find a command by name or alias (including subcommands)
   *
   * @param name - Command name or alias
   * @returns Command or undefined
   *
   * @example
   * ```typescript
   * const cmd = registry.find('build');
   * ```
   */
  find(name: string): Command | undefined {
    // Direct match
    if (this.commands.has(name)) {
      return this.commands.get(name);
    }

    // Check aliases
    for (const cmd of this.commands.values()) {
      if (cmd.aliases.includes(name)) {
        return cmd;
      }
    }

    return undefined;
  }

  /**
   * Find a command with fuzzy matching
   *
   * @param name - Command name (may have typos)
   * @param threshold - Similarity threshold (default: 0.6)
   * @returns Best matching command or undefined
   *
   * @example
   * ```typescript
   * registry.findFuzzy('bulid'); // Might return 'build' command
   * ```
   */
  findFuzzy(name: string, threshold = 0.6): Command | undefined {
    const candidates = this.names();
    const bestMatch = findBestMatch(name, candidates, threshold);
    return bestMatch ? this.get(bestMatch) : undefined;
  }

  /**
   * Clear all commands
   *
   * @example
   * ```typescript
   * registry.clear();
   * ```
   */
  clear(): void {
    this.commands.clear();
  }

  /**
   * Get count of registered commands
   *
   * @returns Number of commands
   */
  get size(): number {
    return this.commands.size;
  }
}
