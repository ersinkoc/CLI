/**
 * Chainable terminal styling API (pigment-compatible)
 *
 * Zero-dependency replacement for @oxog/pigment. Implements the
 * chainable property API where each style accumulates and the final
 * call applies all styles to the text.
 *
 * @example
 * ```typescript
 * const p = createPigment();
 * p.red.bold('Error!');
 * p.hex('#ff6600')('Custom');
 * p.bgBlue.white.bold(' INFO ');
 * ```
 */

import { isSupported, hexToAnsi, rgbToAnsi } from './ansi.js';
import type { Pigment, PigmentOptions, ColorSupport, Styler } from '../types.js';

/** Modifier SGR codes */
const MODIFIERS: Record<string, string> = {
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  strikethrough: '\x1b[9m',
  inverse: '\x1b[7m',
  hidden: '\x1b[8m',
  reset: '\x1b[0m',
};

/** Foreground color SGR codes */
const FOREGROUNDS: Record<string, string> = {
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  grey: '\x1b[90m',
};

/** Background color SGR codes */
const BACKGROUNDS: Record<string, string> = {
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  bgGray: '\x1b[100m',
  bgGrey: '\x1b[100m',
};

/**
 * Detect terminal color support.
 *
 * @param overrideLevel - Force a color level (0-3)
 * @returns Color support descriptor
 */
export function detectColorSupport(overrideLevel?: 0 | 1 | 2 | 3): ColorSupport {
  let level: 0 | 1 | 2 | 3;

  if (overrideLevel !== undefined) {
    level = overrideLevel;
  } else if (!isSupported()) {
    level = 0;
  } else {
    // Terminals advertising COLORTERM get 256+ support; modern defaults are safe
    const colorterm = process.env.COLORTERM;
    const term = process.env.TERM ?? '';
    if (colorterm === 'truecolor' || colorterm === '24bit') {
      level = 3;
    } else if (/256color/.test(term)) {
      level = 2;
    } else if (term || process.stdout.isTTY) {
      level = 1;
    } else {
      level = 0;
    }
  }

  return {
    level,
    hasBasic: level >= 1,
    has256: level >= 2,
    has16m: level >= 3,
  };
}

/**
 * Build a pigment chain node applying accumulated open codes.
 *
 * @param openCodes - SGR sequences accumulated so far
 * @param enabled - Whether styling is enabled (level > 0)
 * @returns Chainable pigment instance
 */
function buildChain(openCodes: string[], enabled: boolean): Pigment {
  const apply = (text: string): string => {
    if (!enabled || openCodes.length === 0) {
      return text;
    }
    return `${openCodes.join('')}${text}\x1b[0m`;
  };

  const chain = apply as Pigment;

  // Style properties: each access returns a new chain with the code appended
  const addStyle = (code: string) => buildChain([...openCodes, code], enabled);

  for (const name of Object.keys(MODIFIERS)) {
    Object.defineProperty(chain, name, {
      get: () => addStyle(MODIFIERS[name]),
      enumerable: true,
      configurable: true,
    });
  }
  for (const name of Object.keys(FOREGROUNDS)) {
    Object.defineProperty(chain, name, {
      get: () => addStyle(FOREGROUNDS[name]),
      enumerable: true,
      configurable: true,
    });
  }
  for (const name of Object.keys(BACKGROUNDS)) {
    Object.defineProperty(chain, name, {
      get: () => addStyle(BACKGROUNDS[name]),
      enumerable: true,
      configurable: true,
    });
  }

  // Bright variants as methods-compatible getters
  const brightMap: Record<string, string> = {
    blackBright: '\x1b[90m',
    redBright: '\x1b[91m',
    greenBright: '\x1b[92m',
    yellowBright: '\x1b[93m',
    blueBright: '\x1b[94m',
    magentaBright: '\x1b[95m',
    cyanBright: '\x1b[96m',
    whiteBright: '\x1b[97m',
    bgBlackBright: '\x1b[100m',
    bgRedBright: '\x1b[101m',
    bgGreenBright: '\x1b[102m',
    bgYellowBright: '\x1b[103m',
    bgBlueBright: '\x1b[104m',
    bgMagentaBright: '\x1b[105m',
    bgCyanBright: '\x1b[106m',
    bgWhiteBright: '\x1b[107m',
  };
  for (const [name, code] of Object.entries(brightMap)) {
    Object.defineProperty(chain, name, {
      get: () => addStyle(code),
      enumerable: true,
      configurable: true,
    });
  }

  // Parameterized styles
  const param = (fn: (code: number) => string) => (code: number) =>
    addStyle(fn(code));
  chain.ansi256 = param((c) => `\x1b[38;5;${c}m`);
  chain.bgAnsi256 = param((c) => `\x1b[48;5;${c}m`);
  chain.rgb = (r: number, g: number, b: number) => addStyle(rgbToAnsi(r, g, b));
  chain.bgRgb = (r: number, g: number, b: number) =>
    addStyle(rgbToAnsi(r, g, b).replace('38;5', '48;5'));
  chain.hex = (color: string) => addStyle(hexToAnsi(color));
  chain.bgHex = (color: string) =>
    addStyle(hexToAnsi(color).replace('38;5', '48;5'));

  return chain;
}

/**
 * Create a chainable pigment instance.
 *
 * @param options - Color options
 * @returns Chainable Pigment instance
 *
 * @example
 * ```typescript
 * const pigment = createPigment();
 * console.log(pigment.red.bold('Error!'));
 * console.log(pigment.hex('#ff6600')('Custom color'));
 * ```
 */
export function createPigment(options: PigmentOptions = {}): Pigment {
  let enabled: boolean;
  if (options.noColor) {
    enabled = false;
  } else if (options.forceColor) {
    enabled = true;
  } else if (options.level !== undefined) {
    enabled = options.level > 0;
  } else {
    enabled = isSupported();
  }
  return buildChain([], enabled);
}

/**
 * Standalone styler factories for one-shot styling.
 */
function makeStyler(code: string): Styler {
  return (text: string) => (isSupported() ? `${code}${text}\x1b[0m` : text);
}

/** Standalone style functions (pigment-compatible surface) */
export const styles: Record<string, Styler> = {
  ...Object.fromEntries(Object.keys(MODIFIERS).map((k) => [k, makeStyler(MODIFIERS[k])])),
  ...Object.fromEntries(Object.keys(FOREGROUNDS).map((k) => [k, makeStyler(FOREGROUNDS[k])])),
  ...Object.fromEntries(Object.keys(BACKGROUNDS).map((k) => [k, makeStyler(BACKGROUNDS[k])])),
  reset: makeStyler('\x1b[0m'),
};

/**
 * Compose multiple stylers into one.
 *
 * @param stylers - Stylers to compose
 * @returns Composed styler
 */
export function compose(...stylers: Styler[]): Styler {
  return (text: string) => stylers.reduce((acc, fn) => fn(acc), text);
}
