import type { OptionDef } from '../types.js';
import type { Token, TokenType } from './tokenizer.js';

/**
 * Parsed option result
 */
export interface ParsedOptions {
  /** Parsed option values */
  values: Record<string, unknown>;
  /** Remaining tokens after parsing */
  remaining: Token[];
  /** Errors encountered */
  errors: string[];
  /** Unknown options found */
  unknown: string[];
}

/**
 * Parse options from tokens
 *
 * @param tokens - Array of tokens
 * @param definitions - Option definitions
 * @param strict - Whether to error on unknown options (default: false)
 * @returns Parsed options
 *
 * @example
 * ```typescript
 * const tokens = [
 *   { type: 'option', value: 'port', index: 0 },
 *   { type: 'value', value: '3000', index: 0 },
 *   { type: 'flag', value: 'v', index: 1 }
 * ];
 *
 * const definitions: OptionDef[] = [
 *   { name: 'port', alias: 'p', type: 'number', description: 'Port number' },
 *   { name: 'verbose', alias: 'v', type: 'boolean', description: 'Verbose output' }
 * ];
 *
 * parseOptions(tokens, definitions);
 * // { values: { port: 3000, verbose: true }, remaining: [], errors: [], unknown: [] }
 * ```
 */
export function parseOptions(
  tokens: Token[],
  definitions: OptionDef[],
  strict = false
): ParsedOptions {
  const values: Record<string, unknown> = {};
  const errors: string[] = [];
  const unknown: string[] = [];

  // Create lookup maps
  const byName = new Map<string, OptionDef>();
  const byAlias = new Map<string, OptionDef>();

  for (const def of definitions) {
    byName.set(def.name, def);
    if (def.alias) {
      byAlias.set(def.alias, def);
    }
    // Also register negatable form
    if (def.negatable) {
      byName.set(`no-${def.name}`, { ...def, name: `no-${def.name}` });
    }
  }

  // Track which options were set (to avoid processing both --no-color and --color)
  const processed = new Set<string>();

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    // Skip non-option tokens
    if (token.type !== 'option' && token.type !== 'flag') {
      i++;
      continue;
    }

    const name = token.value;

    // Skip if already processed (e.g., both --color and --no-color)
    if (processed.has(name)) {
      i++;
      continue;
    }

    // Check if value is attached to short flag (e.g., -p3000)
    // This check must happen before looking up the definition
    if (token.type === 'flag' && name.length > 1) {
      const flagName = name[0];
      const attachedValue = name.slice(1);

      const flagDef = byName.get(flagName) ?? byAlias.get(flagName);
      if (flagDef && flagDef.type !== 'boolean') {
        // This is an attached value, not a flag group
        const value = attachedValue;
        values[flagDef.name] = coerceOptionValue(value, flagDef, errors);
        processed.add(flagDef.name);
        i++;
        continue;
      }
    }

    // Find definition
    // Note: negatable options (--no-xxx) are auto-registered at lines 62-64
    const def = byName.get(name) ?? byAlias.get(name);

    if (!def) {
      if (strict) {
        errors.push(`Unknown option: --${name}`);
      }
      unknown.push(name);
      i++;
      continue;
    }

    processed.add(def.name);

    // Handle flag group (-abc = -a -b -c)
    if (token.type === 'flag' && name.length > 1 && def.type !== 'boolean') {
      // Split into individual flags
      for (const char of name) {
        const charDef = byName.get(char) ?? byAlias.get(char);
        if (charDef?.type === 'boolean') {
          values[charDef.name] = true;
        }
      }
      i++;
      continue;
    }

    // Handle boolean option
    if (def.type === 'boolean' || (!def.type && name.length === 1)) {
      // Check if next token is a value
      const nextToken = tokens[i + 1];
      if (nextToken?.type === 'value') {
        // Explicit value: --flag true
        const strValue = nextToken.value.toLowerCase();
        values[def.name] = strValue === 'true' || strValue === '1' || strValue === 'yes';
        i += 2;
      } else {
        // Flag presence means true
        values[def.name] = true;
        i++;
      }
      continue;
    }

    // Get value from next token or from attached value
    let value: string;

    // Check next token for value
    const nextToken = tokens[i + 1];
    if (nextToken && (nextToken.type === 'value' || nextToken.type === 'argument')) {
      value = nextToken.value;
      i += 2;
    } else if (def.default !== undefined) {
      value = String(def.default);
      i++;
    } else {
      errors.push(`Option --${def.name} requires a value`);
      i++;
      continue;
    }

    // Apply coercion
    values[def.name] = coerceOptionValue(value, def, errors);
  }

  // Apply defaults for unset options
  for (const def of definitions) {
    if (def.name.startsWith('no-')) continue; // Skip negatable forms
    if (!(def.name in values) && def.default !== undefined) {
      values[def.name] = def.default;
    }
  }

  // Get remaining tokens (non-option tokens)
  const remaining = tokens.filter((t) => t.type === 'argument');

  return { values, remaining, errors, unknown };
}

/**
 * Coerce option value to specified type
 *
 * @param value - String value to coerce
 * @param def - Option definition
 * @param errors - Array to collect errors
 * @returns Coerced value
 *
 * @example
 * ```typescript
 * coerceOptionValue('3000', { name: 'port', type: 'number' }, []);
 * // 3000
 * coerceOptionValue('a,b,c', { name: 'items', type: 'array' }, []);
 * // ['a', 'b', 'c']
 * ```
 */
export function coerceOptionValue(
  value: string,
  def: OptionDef,
  errors: string[]
): unknown {
  let coerced: unknown = value;

  // Use custom coercion if provided
  if (def.coerce) {
    try {
      return def.coerce(value);
    } catch {
      errors.push(`Failed to coerce option --${def.name}: "${value}"`);
      return value;
    }
  }

  // Type coercion
  switch (def.type) {
    case 'number':
      const num = Number.parseFloat(value);
      if (Number.isNaN(num)) {
        errors.push(`Option --${def.name} expects a number, got "${value}"`);
        return value;
      }
      coerced = num;
      break;

    case 'boolean':
      coerced = value === 'true' || value === '1' || value === 'yes';
      break;

    case 'array':
      // Split by comma
      coerced = value.split(',').map((v) => v.trim());
      break;

    case 'object':
      // Parse key=value format
      const eqIndex = value.indexOf('=');
      if (eqIndex !== -1) {
        const key = value.slice(0, eqIndex);
        const val = value.slice(eqIndex + 1);
        coerced = { [key]: val };
      } else {
        coerced = { [value]: true };
      }
      break;

    default:
      coerced = value;
  }

  // Validate choices
  if (def.choices && def.choices.length > 0) {
    const valuesToCheck = Array.isArray(coerced) ? coerced : [coerced];
    for (const v of valuesToCheck) {
      if (!def.choices!.includes(v)) {
        errors.push(
          `Option --${def.name} must be one of: ${def.choices.join(', ')} (got "${v}")`
        );
      }
    }
  }

  // Custom validation
  if (def.validate) {
    const result = def.validate(coerced);
    if (result !== true) {
      errors.push(`Option --${def.name}: ${result}`);
    }
  }

  return coerced;
}

/**
 * Parse option flags from string
 *
 * @param flags - Option flags string (e.g., "-p, --port <number>")
 * @returns Parsed flags
 *
 * @example
 * ```typescript
 * parseOptionFlags('-p, --port <number>');
 * // { name: 'port', alias: 'p', type: 'string' }
 * ```
 */
export function parseOptionFlags(flags: string): {
  name: string;
  alias?: string;
  type: 'string' | 'boolean' | 'array' | 'object' | 'number';
} {
  const parts = flags.split(/[,\s]+/).filter(Boolean);

  let name = '';
  let alias: string | undefined;
  let expectsValue = false;

  for (const part of parts) {
    if (part.startsWith('--')) {
      name = part.slice(2);
      // Check for --no-xxx
      if (name.startsWith('no-')) {
        name = name.slice(3);
      }
    } else if (part.startsWith('-')) {
      alias = part.slice(1);
    } else if (part.startsWith('<') || part.startsWith('[')) {
      expectsValue = true;
    }
  }

  // Determine type
  let type: 'string' | 'boolean' | 'array' | 'object' | 'number' = 'string';
  if (!expectsValue) {
    type = 'boolean';
  } else if (flags.includes('<number>')) {
    type = 'number';
  } else if (flags.includes('...')) {
    type = 'array';
  } else if (flags.includes('<key=')) {
    type = 'object';
  }

  return { name, alias, type };
}
