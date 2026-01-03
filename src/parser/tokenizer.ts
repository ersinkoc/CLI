/**
 * Token types for argv parsing
 */
export enum TokenType {
  Argument = 'argument',
  Option = 'option',
  Flag = 'flag',
  Value = 'value',
  Separator = '--',
}

/**
 * Token representing a parsed element from argv
 */
export interface Token {
  /** Token type */
  type: TokenType;
  /** Raw value from argv */
  raw: string;
  /** Processed value (without flags/prefixes) */
  value: string;
  /** Position in original argv */
  index: number;
}

/**
 * Tokenize argv string array into structured tokens
 *
 * @param argv - Arguments array (e.g., process.argv.slice(2))
 * @returns Array of tokens
 *
 * @example
 * ```typescript
 * tokenize(['cmd', '-o', 'value', '--long', '--', 'not-an-option']);
 * // [
 * //   { type: 'argument', raw: 'cmd', value: 'cmd', index: 0 },
 * //   { type: 'option', raw: '-o', value: 'o', index: 1 },
 * //   { type: 'value', raw: 'value', value: 'value', index: 2 },
 * //   { type: 'option', raw: '--long', value: 'long', index: 3 },
 * //   { type: 'separator', raw: '--', value: '--', index: 4 },
 * //   { type: 'argument', raw: 'not-an-option', value: 'not-an-option', index: 5 }
 * // ]
 * ```
 */
export function tokenize(argv: string[]): Token[] {
  const tokens: Token[] = [];
  let afterSeparator = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // Check for separator (--)
    if (arg === '--' && !afterSeparator) {
      tokens.push({
        type: TokenType.Separator,
        raw: arg,
        value: arg,
        index: i,
      });
      afterSeparator = true;
      continue;
    }

    // After separator, everything is an argument
    if (afterSeparator) {
      tokens.push({
        type: TokenType.Argument,
        raw: arg,
        value: arg,
        index: i,
      });
      continue;
    }

    // Check for long option (--option, --option=value)
    if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');

      if (eqIndex !== -1) {
        // --option=value case - split into option and value
        const name = arg.slice(2, eqIndex);
        const value = arg.slice(eqIndex + 1);

        tokens.push({
          type: TokenType.Option,
          raw: arg,
          value: name,
          index: i,
        });

        tokens.push({
          type: TokenType.Value,
          raw: value,
          value: value,
          index: i,
        });
      } else {
        // --option case
        const name = arg.slice(2);
        tokens.push({
          type: TokenType.Option,
          raw: arg,
          value: name,
          index: i,
        });
      }
      continue;
    }

    // Check for short option (-o, -abc, -ovalue)
    if (arg.startsWith('-')) {
      const name = arg.slice(1);

      // Check if it's a number (e.g., -123)
      if (/^\d+(\.\d+)?$/.test(name)) {
        tokens.push({
          type: TokenType.Argument,
          raw: arg,
          value: arg,
          index: i,
        });
        continue;
      }

      // Check if it's attached to a value (-ovalue)
      // We need to check if the rest after first char looks like a value
      if (name.length > 1 && !name.startsWith('no-')) {
        // Could be -ovalue or -abc (multiple flags)
        // We'll treat -ovalue as a single flag with value in parser
        // And -abc as multiple flags in parser
        tokens.push({
          type: TokenType.Flag,
          raw: arg,
          value: name,
          index: i,
        });
      } else {
        // -o case
        tokens.push({
          type: TokenType.Option,
          raw: arg,
          value: name,
          index: i,
        });
      }
      continue;
    }

    // Default to argument
    tokens.push({
      type: TokenType.Argument,
      raw: arg,
      value: arg,
      index: i,
    });
  }

  return tokens;
}

/**
 * Detect if an argument looks like a negative number
 *
 * @param arg - Argument to check
 * @returns true if it looks like a negative number
 *
 * @example
 * ```typescript
 * isNegativeNumber('-123'); // true
 * isNegativeNumber('-12.5'); // true
 * isNegativeNumber('--abc'); // false
 * isNegativeNumber('-abc'); // false
 * ```
 */
export function isNegativeNumber(arg: string): boolean {
  return /^-\d+(\.\d+)?$/.test(arg);
}
