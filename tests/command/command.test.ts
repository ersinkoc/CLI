/**
 * Command class tests
 */

import { describe, it, expect } from 'vitest';
import { Command } from '../../src/command/command.js';

describe('Command', () => {
  it('should create command with name', () => {
    const cmd = new Command('build');
    expect(cmd.name).toBe('build');
  });

  it('should have empty description by default', () => {
    const cmd = new Command('build');
    expect(cmd.description).toBe('');
  });

  it('should set description', () => {
    const cmd = new Command('build');
    cmd.description = 'Build the project';
    expect(cmd.description).toBe('Build the project');
  });

  it('should have no aliases by default', () => {
    const cmd = new Command('build');
    expect(cmd.aliases).toEqual([]);
  });

  it('should add aliases', () => {
    const cmd = new Command('build');
    cmd.aliases = ['b', 'compile'];
    expect(cmd.aliases).toEqual(['b', 'compile']);
  });

  it('should add subcommand', () => {
    const cmd = new Command('cli');
    const sub = cmd.addCommand('build');
    expect(sub.name).toBe('build');
    expect(sub.parent).toBe(cmd);
    expect(cmd.commands.has('build')).toBe(true);
  });

  it('should add argument', () => {
    const cmd = new Command('build');
    cmd.addArgument({ name: 'input', required: true });
    expect(cmd.arguments).toHaveLength(1);
    expect(cmd.arguments[0].name).toBe('input');
  });

  it('should chain addArgument', () => {
    const cmd = new Command('build');
    const result = cmd.addArgument({ name: 'input', required: true });
    expect(result).toBe(cmd);
  });

  it('should add option', () => {
    const cmd = new Command('build');
    cmd.addOption({ name: 'output', alias: 'o', type: 'string' });
    expect(cmd.options).toHaveLength(1);
    expect(cmd.options[0].name).toBe('output');
  });

  it('should chain addOption', () => {
    const cmd = new Command('build');
    const result = cmd.addOption({ name: 'output', alias: 'o', type: 'string' });
    expect(result).toBe(cmd);
  });

  it('should find command by path', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    const dev = build.addCommand('dev');

    expect(cli.findCommand(['build'])).toBe(build);
    expect(cli.findCommand(['build', 'dev'])).toBe(dev);
    expect(cli.findCommand(['unknown'])).toBeUndefined();
    expect(cli.findCommand([])).toBe(cli);
  });

  it('should check if has children', () => {
    const cli = new Command('cli');
    expect(cli.hasChildren()).toBe(false);

    cli.addCommand('build');
    expect(cli.hasChildren()).toBe(true);
  });

  it('should get full name', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    const dev = build.addCommand('dev');

    expect(cli.getFullName()).toBe('cli');
    expect(build.getFullName()).toBe('cli build');
    expect(dev.getFullName()).toBe('cli build dev');
  });

  it('should get command by name or alias', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    build.aliases = ['b'];

    expect(cli.getByNameOrAlias('build')).toBe(build);
    expect(cli.getByNameOrAlias('b')).toBe(build);
    expect(cli.getByNameOrAlias('unknown')).toBeUndefined();
  });

  it('should get all names including aliases', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    build.aliases = ['b'];

    const names = cli.getAllNames();
    expect(names).toContain('cli');
    expect(names).toContain('build');
    expect(names).toContain('b');
  });

  it('should set action handler', () => {
    const cmd = new Command('build');
    const handler = async () => {};
    cmd.action = handler;
    expect(cmd.action).toBe(handler);
  });

  it('should have empty middleware by default', () => {
    const cmd = new Command('build');
    expect(cmd.middleware).toEqual([]);
  });

  it('should handle multiple arguments', () => {
    const cmd = new Command('build');
    cmd.addArgument({ name: 'input', required: true });
    cmd.addArgument({ name: 'output', required: false });
    cmd.addArgument({ name: 'config', required: false });

    expect(cmd.arguments).toHaveLength(3);
    expect(cmd.arguments[0].name).toBe('input');
    expect(cmd.arguments[1].name).toBe('output');
    expect(cmd.arguments[2].name).toBe('config');
  });

  it('should handle multiple options', () => {
    const cmd = new Command('build');
    cmd.addOption({ name: 'output', alias: 'o', type: 'string' });
    cmd.addOption({ name: 'watch', alias: 'w', type: 'boolean' });
    cmd.addOption({ name: 'port', alias: 'p', type: 'number' });

    expect(cmd.options).toHaveLength(3);
    expect(cmd.options[0].name).toBe('output');
    expect(cmd.options[1].name).toBe('watch');
    expect(cmd.options[2].name).toBe('port');
  });

  it('should handle multiple levels of nesting', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    const frontend = build.addCommand('frontend');
    const backend = build.addCommand('backend');

    expect(frontend.getFullName()).toBe('cli build frontend');
    expect(backend.getFullName()).toBe('cli build backend');
    expect(frontend.parent).toBe(build);
    expect(backend.parent).toBe(build);
    expect(build.parent).toBe(cli);
  });

  it('should handle findCommand with partial path', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    build.addCommand('dev');
    build.addCommand('prod');

    const result = cli.findCommand(['build']);
    expect(result).toBe(build);
    expect(result?.name).toBe('build');
  });

  it('should handle findCommand with non-existent intermediate path', () => {
    const cli = new Command('cli');
    cli.addCommand('build');

    const result = cli.findCommand(['build', 'dev', 'test']);
    expect(result).toBeUndefined();
  });

  it('should handle multiple aliases', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    build.aliases = ['b', 'compile', 'make'];

    expect(cli.getByNameOrAlias('build')).toBe(build);
    expect(cli.getByNameOrAlias('b')).toBe(build);
    expect(cli.getByNameOrAlias('compile')).toBe(build);
    expect(cli.getByNameOrAlias('make')).toBe(build);
  });

  it('should handle getAllNames with multiple nested commands', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    build.aliases = ['b'];
    const dev = build.addCommand('dev');
    dev.aliases = ['d'];

    const names = cli.getAllNames();
    expect(names).toContain('cli');
    expect(names).toContain('build');
    expect(names).toContain('b');
    expect(names).toContain('dev');
    expect(names).toContain('d');
  });

  it('should handle argument with description', () => {
    const cmd = new Command('build');
    cmd.addArgument({ name: 'input', required: true, description: 'Input file' });

    expect(cmd.arguments[0].description).toBe('Input file');
  });

  it('should handle option with description', () => {
    const cmd = new Command('build');
    cmd.addOption({ name: 'output', alias: 'o', type: 'string', description: 'Output directory' });

    expect(cmd.options[0].description).toBe('Output directory');
  });

  it('should handle option with default value', () => {
    const cmd = new Command('build');
    cmd.addOption({ name: 'output', alias: 'o', type: 'string', default: 'dist' });

    expect(cmd.options[0].default).toBe('dist');
  });

  it('should handle option without alias', () => {
    const cmd = new Command('build');
    cmd.addOption({ name: 'verbose', type: 'boolean' });

    expect(cmd.options[0].name).toBe('verbose');
    expect(cmd.options[0].alias).toBeUndefined();
  });

  it('should handle getAllNames for command without children', () => {
    const cmd = new Command('build');
    cmd.aliases = ['b', 'compile'];

    const names = cmd.getAllNames();
    expect(names.size).toBe(3);
    expect(names).toContain('build');
    expect(names).toContain('b');
    expect(names).toContain('compile');
  });

  it('should handle findCommand when first level not found', () => {
    const cli = new Command('cli');
    cli.addCommand('build');

    const result = cli.findCommand(['deploy']);
    expect(result).toBeUndefined();
  });

  it('should handle hasChildren for deeply nested command', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    const frontend = build.addCommand('frontend');

    expect(frontend.hasChildren()).toBe(false);
    expect(build.hasChildren()).toBe(true);
    expect(cli.hasChildren()).toBe(true);
  });

  it('should handle getFullName for root command', () => {
    const cli = new Command('cli');
    expect(cli.getFullName()).toBe('cli');
  });

  it('should handle getByNameOrAlias when alias conflicts with command name', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    const compile = cli.addCommand('compile');
    build.aliases = ['compile'];

    // Should return the direct match first
    expect(cli.getByNameOrAlias('compile')).toBe(compile);
  });

  it('should handle commands with arguments and options together', () => {
    const cmd = new Command('build');
    cmd.addArgument({ name: 'input', required: true });
    cmd.addArgument({ name: 'output', required: false });
    cmd.addOption({ name: 'watch', alias: 'w', type: 'boolean' });
    cmd.addOption({ name: 'verbose', alias: 'v', type: 'boolean' });

    expect(cmd.arguments).toHaveLength(2);
    expect(cmd.options).toHaveLength(2);
  });

  it('should handle optional arguments', () => {
    const cmd = new Command('build');
    cmd.addArgument({ name: 'input', required: true });
    cmd.addArgument({ name: 'output', required: false });
    cmd.addArgument({ name: 'config', required: false });

    expect(cmd.arguments[0].required).toBe(true);
    expect(cmd.arguments[1].required).toBe(false);
    expect(cmd.arguments[2].required).toBe(false);
  });

  it('should handle multiple children with same aliases', () => {
    const cli = new Command('cli');
    const build = cli.addCommand('build');
    const test = cli.addCommand('test');
    build.aliases = ['b'];
    test.aliases = ['t'];

    expect(cli.getByNameOrAlias('b')).toBe(build);
    expect(cli.getByNameOrAlias('t')).toBe(test);
  });

  it('should handle command with action and middleware', () => {
    const cmd = new Command('build');
    const actionHandler = async () => {};
    const middlewareFn = async () => {};

    cmd.action = actionHandler;
    cmd.middleware.push(middlewareFn);

    expect(cmd.action).toBe(actionHandler);
    expect(cmd.middleware).toContain(middlewareFn);
  });

  it('should handle multiple middleware functions', () => {
    const cmd = new Command('build');
    const middleware1 = async () => {};
    const middleware2 = async () => {};
    const middleware3 = async () => {};

    cmd.middleware.push(middleware1, middleware2, middleware3);

    expect(cmd.middleware).toHaveLength(3);
    expect(cmd.middleware[0]).toBe(middleware1);
    expect(cmd.middleware[1]).toBe(middleware2);
    expect(cmd.middleware[2]).toBe(middleware3);
  });

  it('should handle deeply nested findCommand', () => {
    const cli = new Command('cli');
    const level1 = cli.addCommand('l1');
    const level2 = level1.addCommand('l2');
    const level3 = level2.addCommand('l3');
    const level4 = level3.addCommand('l4');

    const result = cli.findCommand(['l1', 'l2', 'l3', 'l4']);
    expect(result).toBe(level4);
    expect(result?.getFullName()).toBe('cli l1 l2 l3 l4');
  });

  it('should handle option with different types', () => {
    const cmd = new Command('serve');
    cmd.addOption({ name: 'port', type: 'number', default: 3000 });
    cmd.addOption({ name: 'host', type: 'string', default: 'localhost' });
    cmd.addOption({ name: 'verbose', type: 'boolean' });
    cmd.addOption({ name: 'config', type: 'string' });

    expect(cmd.options[0].type).toBe('number');
    expect(cmd.options[1].type).toBe('string');
    expect(cmd.options[2].type).toBe('boolean');
    expect(cmd.options[3].type).toBe('string');
  });
});
