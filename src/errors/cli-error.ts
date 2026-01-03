/**
 * Custom CLI error class
 * All CLI-related errors extend from this class
 *
 * @example
 * ```typescript
 * throw new CLIError('File not found', 'FILE_NOT_FOUND', 404);
 * ```
 */
export class CLIError extends Error {
  /**
   * Error code for programmatic handling
   */
  code: string;

  /**
   * Exit code for process termination
   */
  exitCode: number;

  /**
   * Create a new CLI error
   *
   * @param message - Human-readable error message
   * @param code - Error code for programmatic handling
   * @param exitCode - Exit code (default: 1)
   *
   * @example
   * ```typescript
   * const error = new CLIError('Command failed', 'COMMAND_FAILED', 1);
   * ```
   */
  constructor(message: string, code: string, exitCode = 1) {
    super(message);
    this.name = 'CLIError';
    this.code = code;
    this.exitCode = exitCode;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CLIError);
    }
  }
}

/**
 * Error thrown when a command is not found
 *
 * @example
 * ```typescript
 * throw new UnknownCommandError('depoly', ['deploy', 'build', 'test']);
 * ```
 */
export class UnknownCommandError extends CLIError {
  /** The command that was not found */
  command: string;

  constructor(command: string) {
    super(
      `Command "${command}" not found`,
      'UNKNOWN_COMMAND',
      1
    );
    this.name = 'UnknownCommandError';
    this.command = command;
  }
}

/**
 * Error thrown when a required argument is missing
 *
 * @example
 * ```typescript
 * throw new MissingArgumentError('input', 'file');
 * ```
 */
export class MissingArgumentError extends CLIError {
  /** The argument that is missing */
  argument: string;

  constructor(argument: string) {
    super(
      `Missing required argument: ${argument}`,
      'MISSING_ARGUMENT',
      1
    );
    this.name = 'MissingArgumentError';
    this.argument = argument;
  }
}

/**
 * Error thrown when an option value is invalid
 *
 * @example
 * ```typescript
 * throw new InvalidOptionError('port', 'invalid', 'number');
 * ```
 */
export class InvalidOptionError extends CLIError {
  /** The option with invalid value */
  option: string;

  /** The invalid value */
  value: unknown;

  /** Expected type or format */
  expected: string;

  constructor(option: string, value: unknown, expected: string) {
    super(
      `Invalid value for option --${option}: ${String(value)} (expected ${expected})`,
      'INVALID_OPTION',
      1
    );
    this.name = 'InvalidOptionError';
    this.option = option;
    this.value = value;
    this.expected = expected;
  }
}

/**
 * Error thrown when an unknown option is provided
 *
 * @example
 * ```typescript
 * throw new UnknownOptionError('verbos');
 * ```
 */
export class UnknownOptionError extends CLIError {
  /** The unknown option */
  option: string;

  constructor(option: string) {
    super(
      `Unknown option: --${option}`,
      'UNKNOWN_OPTION',
      1
    );
    this.name = 'UnknownOptionError';
    this.option = option;
  }
}

/**
 * Error thrown when validation fails
 *
 * @example
 * ```typescript
 * throw new ValidationError('Port must be between 1 and 65536');
 * ```
 */
export class ValidationError extends CLIError {
  constructor(message: string) {
    super(
      message,
      'VALIDATION_ERROR',
      1
    );
    this.name = 'ValidationError';
  }
}
