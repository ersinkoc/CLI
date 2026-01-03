/**
 * Command Router tests
 */

import { describe, it, expect } from 'vitest';
import { CommandRouter } from '../../src/command/router.js';
import { Command } from '../../src/command/command.js';

describe('CommandRouter', () => {
  it('should create router with root command', () => {
    const root = new Command('cli');
    const router = new CommandRouter(root);
    expect(router).toBeDefined();
  });

  it('should route to root command', () => {
    const root = new Command('cli');
    const router = new CommandRouter(root);
    const result = router.route([]);
    expect(result.command).toBe(root);
  });

  it('should route to direct subcommand', () => {
    const root = new Command('cli');
    root.addCommand('build');
    const router = new CommandRouter(root);
    const result = router.route(['build']);
    expect(result.command.name).toBe('build');
    expect(result.path).toEqual(['build']);
  });

  it('should route to nested subcommand', () => {
    const root = new Command('cli');
    const build = root.addCommand('build');
    build.addCommand('dev');
    const router = new CommandRouter(root);
    const result = router.route(['build', 'dev']);
    expect(result.command.name).toBe('dev');
    expect(result.path).toEqual(['build', 'dev']);
  });

  it('should stop at first option', () => {
    const root = new Command('cli');
    const build = root.addCommand('build');
    build.addCommand('dev');
    const router = new CommandRouter(root);
    const result = router.route(['build', '--verbose']);
    expect(result.command.name).toBe('build');
    expect(result.path).toEqual(['build']);
  });

  it('should include remaining tokens', () => {
    const root = new Command('cli');
    root.addCommand('build');
    const router = new CommandRouter(root);
    const result = router.route(['build', 'file.txt', '--verbose']);
    expect(result.command.name).toBe('build');
    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0].value).toBe('file.txt');
  });

  it('should include original argv', () => {
    const root = new Command('cli');
    const router = new CommandRouter(root);
    const argv = ['build', '--verbose'];
    const result = router.route(argv);
    expect(result.argv).toBe(argv);
  });

  it('should suggest command names', () => {
    const root = new Command('cli');
    root.addCommand('build');
    root.addCommand('config');
    const router = new CommandRouter(root);
    const suggestion = router.suggest('bild');
    expect(suggestion).toBe('build');
  });

  it('should return undefined for no suggestion', () => {
    const root = new Command('cli');
    root.addCommand('build');
    const router = new CommandRouter(root);
    const suggestion = router.suggest('xyz');
    expect(suggestion).toBeUndefined();
  });

  it('should route by alias', () => {
    const root = new Command('cli');
    const build = root.addCommand('build');
    build.aliases = ['b'];
    const router = new CommandRouter(root);
    const result = router.route(['b']);
    expect(result.command).toBe(build);
  });

  it('should suggest based on contains match', () => {
    const root = new Command('cli');
    root.addCommand('configure');
    const router = new CommandRouter(root);
    const suggestion = router.suggest('config');
    // 'config' is contained in 'configure'
    expect(suggestion).toBe('configure');
  });

  it('should suggest based on Levenshtein similarity', () => {
    const root = new Command('cli');
    root.addCommand('build');
    const router = new CommandRouter(root);
    const suggestion = router.suggest('buid');
    // 'buid' is a typo of 'build' (missing 'l'), should suggest it
    expect(suggestion).toBe('build');
  });

  it('should suggest based on Levenshtein similarity with multiple candidates', () => {
    const root = new Command('cli');
    root.addCommand('install');
    root.addCommand('uninstall');
    root.addCommand('update');
    const router = new CommandRouter(root);
    const suggestion = router.suggest('instal');
    // 'instal' is a typo of 'install' (missing 'l')
    // Should suggest 'install' via Levenshtein similarity
    expect(suggestion).toBe('install');
  });

  it('should handle empty command tree for suggestions', () => {
    const root = new Command('cli');
    const router = new CommandRouter(root);
    const suggestion = router.suggest('test');
    expect(suggestion).toBeUndefined();
  });
});
