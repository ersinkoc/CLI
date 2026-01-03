/**
 * Validation Plugin tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validationPlugin } from '../../src/plugins/core/validation.js';
import { CLIKernelImpl } from '../../src/kernel.js';
import { ValidationError } from '../../src/errors/cli-error.js';

describe('Validation Plugin', () => {
  let kernel: CLIKernelImpl;

  beforeEach(() => {
    kernel = new CLIKernelImpl();
  });

  it('should create validation plugin', () => {
    expect(validationPlugin).toBeDefined();
    const plugin = validationPlugin();
    expect(plugin.name).toBe('validation');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should have correct structure', () => {
    const plugin = validationPlugin();
    expect(plugin).toHaveProperty('name');
    expect(plugin).toHaveProperty('version');
    expect(plugin).toHaveProperty('install');
    expect(typeof plugin.install).toBe('function');
  });

  it('should install without errors', () => {
    expect(() => validationPlugin().install(kernel)).not.toThrow();
  });

  it('should pass validation when all requirements are met', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [
        { name: 'input', required: true },
      ],
      options: [
        { name: 'output', required: true },
      ],
    };

    const context = {
      args: { input: 'file.txt' },
      options: { output: 'dist' },
    };

    // Should not throw
    await kernel.emit('command:before', { command, context });
  });

  it('should throw ValidationError for missing required argument', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [
        { name: 'input', required: true },
      ],
      options: [],
    };

    const context = {
      args: {},
      options: {},
    };

    await expect(kernel.emit('command:before', { command, context })).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for missing required option', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [],
      options: [
        { name: 'output', required: true },
      ],
    };

    const context = {
      args: {},
      options: {},
    };

    await expect(kernel.emit('command:before', { command, context })).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for failed custom argument validation', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [
        { name: 'age', validate: (v: number) => v >= 18 || 'Must be 18 or older' },
      ],
      options: [],
    };

    const context = {
      args: { age: 15 },
      options: {},
    };

    await expect(kernel.emit('command:before', { command, context })).rejects.toThrow(ValidationError);
  });

  it('should pass custom argument validation when valid', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [
        { name: 'age', validate: (v: number) => v >= 18 || 'Must be 18 or older' },
      ],
      options: [],
    };

    const context = {
      args: { age: 20 },
      options: {},
    };

    // Should not throw
    await kernel.emit('command:before', { command, context });
  });

  it('should throw ValidationError for failed custom option validation', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [],
      options: [
        { name: 'port', validate: (v: number) => v > 0 || 'Must be positive' },
      ],
    };

    const context = {
      args: {},
      options: { port: -1 },
    };

    await expect(kernel.emit('command:before', { command, context })).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid choice', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [],
      options: [
        { name: 'format', choices: ['json', 'yaml'] },
      ],
    };

    const context = {
      args: {},
      options: { format: 'xml' },
    };

    await expect(kernel.emit('command:before', { command, context })).rejects.toThrow(ValidationError);
  });

  it('should pass validation for valid choice', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [],
      options: [
        { name: 'format', choices: ['json', 'yaml'] },
      ],
    };

    const context = {
      args: {},
      options: { format: 'json' },
    };

    // Should not throw
    await kernel.emit('command:before', { command, context });
  });

  it('should validate array choices', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [],
      options: [
        { name: 'formats', choices: ['json', 'yaml', 'xml'] },
      ],
    };

    const context = {
      args: {},
      options: { formats: ['json', 'yaml'] },
    };

    // Should not throw
    await kernel.emit('command:before', { command, context });
  });

  it('should throw ValidationError for invalid array choice', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [],
      options: [
        { name: 'formats', choices: ['json', 'yaml'] },
      ],
    };

    const context = {
      args: {},
      options: { formats: ['json', 'xml'] },
    };

    await expect(kernel.emit('command:before', { command, context })).rejects.toThrow(ValidationError);
  });

  it('should skip validation when value is undefined and not required', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [],
      options: [
        { name: 'optional', required: false, validate: (v: any) => v > 0 || 'Must be positive' },
      ],
    };

    const context = {
      args: {},
      options: {},
    };

    // Should not throw - validation is skipped for undefined values
    await kernel.emit('command:before', { command, context });
  });

  it('should validate multiple arguments and options', async () => {
    validationPlugin().install(kernel);

    const command = {
      arguments: [
        { name: 'input', required: true },
        { name: 'output', required: true },
      ],
      options: [
        { name: 'verbose', required: false },
        { name: 'format', choices: ['json', 'yaml'] },
      ],
    };

    const context = {
      args: { input: 'in.txt', output: 'out.txt' },
      options: { verbose: true, format: 'json' },
    };

    // Should not throw
    await kernel.emit('command:before', { command, context });
  });
});
