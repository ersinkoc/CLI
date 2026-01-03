import type { ArgumentDef } from '../types.js';
import type { Token } from './tokenizer.js';

/**
 * Parsed argument result
 */
export interface ParsedArguments {
  /** Parsed argument values */
  values: Record<string, unknown>;
  /** Remaining tokens after parsing */
  remaining: Token[];
  /** Errors encountered */
  errors: string[];
}

/**
 * Parse positional arguments from tokens
 *
 * @param tokens - Array of tokens
 * @param definitions - Argument definitions
 * @returns Parsed arguments
 *
 * @example
 * ```typescript
 * const tokens = [
 *   { type: 'argument', value: 'myfile.txt', index: 0 },
 *   { type: 'argument', value: 'output.txt', index: 1 }
 * ];
 *
 * const definitions: ArgumentDef[] = [
 *   { name: 'input', required: true, type: 'string', description: 'Input file' },
 *   { name: 'output', required: false, type: 'string', description: 'Output file' }
 * ];
 *
 * parseArguments(tokens, definitions);
 * // { values: { input: 'myfile.txt', output: 'output.txt' }, remaining: [], errors: [] }
 * ```
 */
export function parseArguments(
  tokens: Token[],
  definitions: ArgumentDef[]
): ParsedArguments {
  const values: Record<string, unknown> = {};
  const errors: string[] = [];
  const remaining: Token[] = [];

  // Filter only argument tokens
  const argTokens = tokens.filter((t) => t.type === 'argument' || t.type === 'value');

  let tokenIndex = 0;
  let defIndex = 0;

  while (defIndex < definitions.length && tokenIndex < argTokens.length) {
    const def = definitions[defIndex];
    const token = argTokens[tokenIndex];

    // Check if this is a variadic argument
    if (def.variadic) {
      const variadicValues: string[] = [];

      // Consume all remaining tokens for this variadic argument
      while (tokenIndex < argTokens.length) {
        variadicValues.push(argTokens[tokenIndex].value);
        tokenIndex++;
      }

      // Apply coercion
      let value: unknown = variadicValues;
      if (def.type === 'number') {
        value = variadicValues.map((v) => Number.parseFloat(v));
      } else if (def.coerce) {
        value = variadicValues.map(def.coerce);
      }

      values[def.name] = value;
      defIndex++;
      break;
    }

    // Parse single argument
    let value: unknown = token.value;

    // Apply type coercion
    if (def.type === 'number') {
      const num = Number.parseFloat(value as string);
      if (Number.isNaN(num)) {
        errors.push(`Argument ${def.name} expects a number, got "${value}"`);
        value = token.value;
      } else {
        value = num;
      }
    } else if (def.type === 'boolean') {
      value = value === 'true' || value === '1';
    } else if (def.coerce) {
      try {
        value = def.coerce(value as string);
      } catch {
        errors.push(`Failed to coerce argument ${def.name}: "${value}"`);
        value = token.value;
      }
    }

    // Apply validation
    if (def.validate) {
      const result = def.validate(value);
      if (result !== true) {
        errors.push(`Argument ${def.name}: ${result}`);
      }
    }

    values[def.name] = value;
    tokenIndex++;
    defIndex++;
  }

  // Check for missing required arguments
  for (let i = defIndex; i < definitions.length; i++) {
    const def = definitions[i];

    if (def.required && !def.variadic) {
      if (def.default !== undefined) {
        values[def.name] = def.default;
      } else {
        errors.push(`Missing required argument: ${def.name}`);
      }
    } else if (def.default !== undefined) {
      values[def.name] = def.default;
    }
  }

  // Remaining tokens are unparsed arguments
  if (tokenIndex < argTokens.length) {
    remaining.push(...argTokens.slice(tokenIndex));
  }

  // Also keep non-argument tokens
  for (const token of tokens) {
    if (token.type !== 'argument' && token.type !== 'value') {
      remaining.push(token);
    }
  }

  return { values, remaining, errors };
}

/**
 * Parse argument definition from string
 *
 * @param def - Argument definition string (e.g., "<name>", "[file]", "<files...>")
 * @returns Parsed definition
 *
 * @example
 * ```typescript
 * parseArgumentDef('<name>'); // { name: 'name', required: true, variadic: false }
 * parseArgumentDef('[file]'); // { name: 'file', required: false, variadic: false }
 * parseArgumentDef('<items...>'); // { name: 'items', required: true, variadic: true }
 * parseArgumentDef('[items...]'); // { name: 'items', required: false, variadic: true }
 * ```
 */
export function parseArgumentDef(def: string): Omit<ArgumentDef, 'description'> {
  const trimmed = def.trim();

  // Check for variadic
  const variadic = trimmed.endsWith('...');
  const name = variadic ? trimmed.slice(1, -4) : trimmed.slice(1, -1);

  // Check if required
  const required = trimmed.startsWith('<');

  return {
    name,
    required,
    variadic,
  };
}
