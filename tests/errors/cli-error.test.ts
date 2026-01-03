/**
 * CLI Error classes tests
 */

import { describe, it, expect } from 'vitest';
import {
  CLIError,
  UnknownCommandError,
  MissingArgumentError,
  InvalidOptionError,
  UnknownOptionError,
  ValidationError,
} from '../../src/errors/cli-error.js';

describe('CLIError', () => {
  it('should create CLIError with message and code', () => {
    const error = new CLIError('Test error', 'TEST_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.name).toBe('CLIError');
    expect(error.exitCode).toBe(1);
  });

  it('should create CLIError with custom exit code', () => {
    const error = new CLIError('Test error', 'TEST_ERROR', 42);
    expect(error.exitCode).toBe(42);
  });

  it('should maintain stack trace', () => {
    const error = new CLIError('Test error', 'TEST_ERROR');
    expect(error.stack).toBeDefined();
  });

  it('should be instance of Error', () => {
    const error = new CLIError('Test error', 'TEST_ERROR');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof CLIError).toBe(true);
  });
});

describe('UnknownCommandError', () => {
  it('should create UnknownCommandError with command name', () => {
    const error = new UnknownCommandError('depoly');
    expect(error.message).toContain('depoly');
    expect(error.command).toBe('depoly');
    expect(error.code).toBe('UNKNOWN_COMMAND');
    expect(error.name).toBe('UnknownCommandError');
    expect(error.exitCode).toBe(1);
  });

  it('should be instance of CLIError', () => {
    const error = new UnknownCommandError('test');
    expect(error instanceof CLIError).toBe(true);
    expect(error instanceof UnknownCommandError).toBe(true);
  });
});

describe('MissingArgumentError', () => {
  it('should create MissingArgumentError with argument name', () => {
    const error = new MissingArgumentError('input');
    expect(error.message).toContain('input');
    expect(error.argument).toBe('input');
    expect(error.code).toBe('MISSING_ARGUMENT');
    expect(error.name).toBe('MissingArgumentError');
    expect(error.exitCode).toBe(1);
  });

  it('should be instance of CLIError', () => {
    const error = new MissingArgumentError('test');
    expect(error instanceof CLIError).toBe(true);
    expect(error instanceof MissingArgumentError).toBe(true);
  });
});

describe('InvalidOptionError', () => {
  it('should create InvalidOptionError with option, value, and expected type', () => {
    const error = new InvalidOptionError('port', 'invalid', 'number');
    expect(error.message).toContain('port');
    expect(error.message).toContain('invalid');
    expect(error.message).toContain('number');
    expect(error.option).toBe('port');
    expect(error.value).toBe('invalid');
    expect(error.expected).toBe('number');
    expect(error.code).toBe('INVALID_OPTION');
    expect(error.name).toBe('InvalidOptionError');
    expect(error.exitCode).toBe(1);
  });

  it('should handle non-string values', () => {
    const error = new InvalidOptionError('port', 99999, '1-65535');
    expect(error.value).toBe(99999);
    expect(error.expected).toBe('1-65535');
  });

  it('should be instance of CLIError', () => {
    const error = new InvalidOptionError('test', 'value', 'type');
    expect(error instanceof CLIError).toBe(true);
    expect(error instanceof InvalidOptionError).toBe(true);
  });
});

describe('UnknownOptionError', () => {
  it('should create UnknownOptionError with option name', () => {
    const error = new UnknownOptionError('verbos');
    expect(error.message).toContain('verbos');
    expect(error.option).toBe('verbos');
    expect(error.code).toBe('UNKNOWN_OPTION');
    expect(error.name).toBe('UnknownOptionError');
    expect(error.exitCode).toBe(1);
  });

  it('should be instance of CLIError', () => {
    const error = new UnknownOptionError('test');
    expect(error instanceof CLIError).toBe(true);
    expect(error instanceof UnknownOptionError).toBe(true);
  });
});

describe('ValidationError', () => {
  it('should create ValidationError with message', () => {
    const error = new ValidationError('Port must be between 1 and 65536');
    expect(error.message).toBe('Port must be between 1 and 65536');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
    expect(error.exitCode).toBe(1);
  });

  it('should be instance of CLIError', () => {
    const error = new ValidationError('Test validation');
    expect(error instanceof CLIError).toBe(true);
    expect(error instanceof ValidationError).toBe(true);
  });
});
