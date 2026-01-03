/**
 * Command Registry tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry } from '../../src/command/registry.js';
import { Command } from '../../src/command/command.js';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  describe('register', () => {
    it('should register a command', () => {
      const cmd = new Command('build');
      registry.register(cmd);
      expect(registry.has('build')).toBe(true);
    });

    it('should allow registering multiple commands', () => {
      registry.register(new Command('build'));
      registry.register(new Command('test'));
      registry.register(new Command('deploy'));
      expect(registry.size).toBe(3);
    });

    it('should replace existing command with same name', () => {
      const cmd1 = new Command('build');
      const cmd2 = new Command('build');
      cmd2.description = 'New description';
      registry.register(cmd1);
      registry.register(cmd2);
      expect(registry.get('build')?.description).toBe('New description');
      expect(registry.size).toBe(1);
    });
  });

  describe('unregister', () => {
    it('should unregister a command by name', () => {
      registry.register(new Command('build'));
      const result = registry.unregister('build');
      expect(result).toBe(true);
      expect(registry.has('build')).toBe(false);
    });

    it('should return false for non-existent command', () => {
      const result = registry.unregister('nonexistent');
      expect(result).toBe(false);
    });

    it('should decrease size when unregistering', () => {
      registry.register(new Command('build'));
      registry.register(new Command('test'));
      registry.unregister('build');
      expect(registry.size).toBe(1);
    });
  });

  describe('get', () => {
    it('should get registered command', () => {
      const cmd = new Command('build');
      registry.register(cmd);
      const result = registry.get('build');
      expect(result).toBe(cmd);
    });

    it('should return undefined for non-existent command', () => {
      const result = registry.get('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered command', () => {
      registry.register(new Command('build'));
      expect(registry.has('build')).toBe(true);
    });

    it('should return false for non-existent command', () => {
      expect(registry.has('nonexistent')).toBe(false);
    });

    it('should return false after unregistering', () => {
      registry.register(new Command('build'));
      registry.unregister('build');
      expect(registry.has('build')).toBe(false);
    });
  });

  describe('list', () => {
    it('should return empty array for empty registry', () => {
      const result = registry.list();
      expect(result).toEqual([]);
    });

    it('should return all registered commands', () => {
      const build = new Command('build');
      const test = new Command('test');
      registry.register(build);
      registry.register(test);
      const result = registry.list();
      expect(result).toHaveLength(2);
      expect(result).toContain(build);
      expect(result).toContain(test);
    });
  });

  describe('names', () => {
    it('should return empty array for empty registry', () => {
      const result = registry.names();
      expect(result).toEqual([]);
    });

    it('should return all command names', () => {
      registry.register(new Command('build'));
      registry.register(new Command('test'));
      registry.register(new Command('deploy'));
      const result = registry.names();
      expect(result).toHaveLength(3);
      expect(result).toContain('build');
      expect(result).toContain('test');
      expect(result).toContain('deploy');
    });
  });

  describe('find', () => {
    it('should find command by name', () => {
      const cmd = new Command('build');
      registry.register(cmd);
      const result = registry.find('build');
      expect(result).toBe(cmd);
    });

    it('should find command by alias', () => {
      const cmd = new Command('build');
      cmd.aliases = ['b'];
      registry.register(cmd);
      const result = registry.find('b');
      expect(result).toBe(cmd);
    });

    it('should return undefined for non-existent command', () => {
      const result = registry.find('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should prefer exact name match over alias', () => {
      const build = new Command('build');
      build.aliases = ['b'];
      registry.register(build);
      const result = registry.find('build');
      expect(result).toBe(build);
    });

    it('should search through all commands for alias', () => {
      const build = new Command('build');
      build.aliases = ['b', 'bd'];
      const bundle = new Command('bundle');
      bundle.aliases = ['bnd'];
      registry.register(build);
      registry.register(bundle);
      expect(registry.find('b')).toBe(build);
      expect(registry.find('bd')).toBe(build);
      expect(registry.find('bnd')).toBe(bundle);
    });
  });

  describe('findFuzzy', () => {
    beforeEach(() => {
      registry.register(new Command('build'));
      registry.register(new Command('config'));
      registry.register(new Command('deploy'));
      registry.register(new Command('develop'));
    });

    it('should find exact match', () => {
      const result = registry.findFuzzy('build');
      expect(result?.name).toBe('build');
    });

    it('should find fuzzy match for typo', () => {
      const result = registry.findFuzzy('bulid');
      expect(result?.name).toBe('build');
    });

    it('should find fuzzy match for partial word', () => {
      const result = registry.findFuzzy('bld');
      expect(result?.name).toBe('build');
    });

    it('should return undefined for very different word', () => {
      const result = registry.findFuzzy('xyzabc');
      expect(result).toBeUndefined();
    });

    it('should use custom threshold', () => {
      const result = registry.findFuzzy('bld', 0.3);
      expect(result?.name).toBe('build');
    });

    it('should return undefined when no command matches threshold', () => {
      const result = registry.findFuzzy('xyz', 0.8);
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty registry', () => {
      const emptyRegistry = new CommandRegistry();
      const result = emptyRegistry.findFuzzy('build');
      expect(result).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all commands', () => {
      registry.register(new Command('build'));
      registry.register(new Command('test'));
      registry.register(new Command('deploy'));
      registry.clear();
      expect(registry.size).toBe(0);
      expect(registry.list()).toEqual([]);
      expect(registry.names()).toEqual([]);
    });

    it('should allow re-registering after clear', () => {
      registry.register(new Command('build'));
      registry.clear();
      registry.register(new Command('test'));
      expect(registry.has('test')).toBe(true);
      expect(registry.has('build')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty registry', () => {
      expect(registry.size).toBe(0);
    });

    it('should return count of registered commands', () => {
      registry.register(new Command('build'));
      expect(registry.size).toBe(1);
      registry.register(new Command('test'));
      expect(registry.size).toBe(2);
    });

    it('should decrease when unregistering', () => {
      registry.register(new Command('build'));
      registry.register(new Command('test'));
      registry.unregister('build');
      expect(registry.size).toBe(1);
    });

    it('should reset to 0 after clear', () => {
      registry.register(new Command('build'));
      registry.register(new Command('test'));
      registry.clear();
      expect(registry.size).toBe(0);
    });
  });
});
