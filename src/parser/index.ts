// Tokenizer
export * from './tokenizer.js';

// Argument parser
export * from './arguments.js';

// Option parser
export * from './options.js';

import { tokenize } from './tokenizer.js';
import { parseArguments } from './arguments.js';
import { parseOptions } from './options.js';
import type { ArgumentDef, OptionDef } from '../types.js';

/**
 * Parse argv into arguments and options
 *
 * @param argv - Arguments array (e.g., process.argv.slice(2))
 * @param argDefs - Argument definitions
 * @param optDefs - Option definitions
 * @param strict - Whether to error on unknown options
 * @returns Parsed arguments and options
 *
 * @example
 * ```typescript
 * const argv = ['build', 'src', '-o', 'dist', '--watch'];
 * const result = parse(argv, argDefs, optDefs);
 * ```
 */
export interface ParseResult {
  /** Parsed argument values */
  args: Record<string, unknown>;
  /** Parsed option values */
  options: Record<string, unknown>;
  /** Remaining unparsed tokens */
  remaining: string[];
  /** Errors encountered */
  errors: string[];
  /** Unknown options */
  unknown: string[];
}

export function parse(
  argv: string[],
  argDefs: ArgumentDef[],
  optDefs: OptionDef[],
  strict = false
): ParseResult {
  // Tokenize
  const tokens = tokenize(argv);

  // Parse options first
  const optResult = parseOptions(tokens, optDefs, strict);

  // Parse arguments from remaining
  const argResult = parseArguments(optResult.remaining, argDefs);

  // Combine errors
  const errors = [...optResult.errors, ...argResult.errors];

  return {
    args: argResult.values,
    options: optResult.values,
    remaining: argResult.remaining.map((t) => t.raw),
    errors,
    unknown: optResult.unknown,
  };
}
