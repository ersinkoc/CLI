/**
 * ANSI escape codes for terminal styling
 * Implements all color and style codes from scratch
 *
 * @example
 * ```typescript
 * console.log(`${ANSI.red}Error text${ANSI.reset}`);
 * console.log(`${ANSI.bold}${ANSI.green}Success!${ANSI.reset}`);
 * ```
 */

/**
 * Reset all styles
 */
export const reset = '\x1b[0m';

// Foreground colors
export const black = '\x1b[30m';
export const red = '\x1b[31m';
export const green = '\x1b[32m';
export const yellow = '\x1b[33m';
export const blue = '\x1b[34m';
export const magenta = '\x1b[35m';
export const cyan = '\x1b[36m';
export const white = '\x1b[37m';
export const brightBlack = '\x1b[90m';
export const brightRed = '\x1b[91m';
export const brightGreen = '\x1b[92m';
export const brightYellow = '\x1b[93m';
export const brightBlue = '\x1b[94m';
export const brightMagenta = '\x1b[95m';
export const brightCyan = '\x1b[96m';
export const brightWhite = '\x1b[97m';

// Background colors
export const bgBlack = '\x1b[40m';
export const bgRed = '\x1b[41m';
export const bgGreen = '\x1b[42m';
export const bgYellow = '\x1b[43m';
export const bgBlue = '\x1b[44m';
export const bgMagenta = '\x1b[45m';
export const bgCyan = '\x1b[46m';
export const bgWhite = '\x1b[47m';
export const bgBrightBlack = '\x1b[100m';
export const bgBrightRed = '\x1b[101m';
export const bgBrightGreen = '\x1b[102m';
export const bgBrightYellow = '\x1b[103m';
export const bgBrightBlue = '\x1b[104m';
export const bgBrightMagenta = '\x1b[105m';
export const bgBrightCyan = '\x1b[106m';
export const bgBrightWhite = '\x1b[107m';

// Text styles
export const bold = '\x1b[1m';
export const dim = '\x1b[2m';
export const italic = '\x1b[3m';
export const underline = '\x1b[4m';
export const blink = '\x1b[5m';
export const reverse = '\x1b[7m';
export const hidden = '\x1b[8m';
export const strikethrough = '\x1b[9m';

// Cursor movement
export const cursorUp = (n = 1): string => `\x1b[${n}A`;
export const cursorDown = (n = 1): string => `\x1b[${n}B`;
export const cursorForward = (n = 1): string => `\x1b[${n}C`;
export const cursorBack = (n = 1): string => `\x1b[${n}D`;
export const cursorNextLine = (n = 1): string => `\x1b[${n}E`;
export const cursorPrevLine = (n = 1): string => `\x1b[${n}F`;
export const cursorHorizontalAbsolute = (n = 1): string => `\x1b[${n}G`;
export const cursorPosition = (row: number, col: number): string => `\x1b[${row};${col}H`;
export const cursorShow = '\x1b[?25h';
export const cursorHide = '\x1b[?25l';
export const saveCursorPosition = '\x1b[s';
export const restoreCursorPosition = '\x1b[u';

// Screen clearing
export const clearScreen = '\x1b[2J';
export const clearLine = '\x1b[2K';
export const clearLineDown = '\x1b[0J';
export const clearLineUp = '\x1b[1J';

/**
 * Check if ANSI codes are supported in the current terminal
 *
 * @returns true if colors are supported
 *
 * @example
 * ```typescript
 * if (isSupported()) {
 *   console.log(color.red('Colored output'));
 * } else {
 *   console.log('Plain output');
 * }
 * ```
 */
export function isSupported(): boolean {
  // Check NO_COLOR standard (https://no-color.org/)
  if (process.env.NO_COLOR) {
    return false;
  }

  // Check FORCE_COLOR
  if (process.env.FORCE_COLOR) {
    return true;
  }

  // Check if we're in a TTY
  if (process.stdout.isTTY) {
    return true;
  }

  return false;
}

/**
 * Create a colorized string
 *
 * @param text - Text to colorize
 * @param code - ANSI code to apply
 * @returns Colorized text (or plain text if not supported)
 *
 * @example
 * ```typescript
 * colorize('Hello', red); // "\x1b[31mHello\x1b[0m"
 * ```
 */
export function colorize(text: string, code: string): string {
  if (!isSupported()) {
    return text;
  }
  return `${code}${text}${reset}`;
}

/**
 * Convert hex color to ANSI 256-color code
 *
 * @param hex - Hex color (e.g., "#ff6600")
 * @returns ANSI color code
 *
 * @example
 * ```typescript
 * hexToAnsi('#ff6600'); // "\x1b[38;5;208m"
 * ```
 */
export function hexToAnsi(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  // Convert to 256-color mode
  if (r === g && g === b) {
    // Grayscale
    if (r < 8) {
      return `\x1b[38;5;16m`;
    } else if (r > 248) {
      return `\x1b[38;5;231m`;
    } else {
      const code = Math.round(((r - 8) / 247) * 24) + 232;
      return `\x1b[38;5;${code}m`;
    }
  } else {
    // RGB
    const code =
      16 +
      36 * Math.round((r / 255) * 5) +
      6 * Math.round((g / 255) * 5) +
      Math.round((b / 255) * 5);
    return `\x1b[38;5;${code}m`;
  }
}

/**
 * Convert RGB color to ANSI 256-color code
 *
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns ANSI color code
 *
 * @example
 * ```typescript
 * rgbToAnsi(255, 102, 0); // "\x1b[38;5;208m"
 * ```
 */
export function rgbToAnsi(r: number, g: number, b: number): string {
  return hexToAnsi(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
}

/**
 * Color utility class with chainable styles
 *
 * @example
 * ```typescript
 * color.red('Error!');
 * color.green.bold('Success!');
 * color.hex('#ff6600')('Custom color');
 * color.bgBlue.white(' INFO ');
 * ```
 */
export class ColorUtils {
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  private apply(code: string): ColorUtils {
    if (isSupported()) {
      this.text = `${code}${this.text}`;
    }
    return this;
  }

  private end(): string {
    if (isSupported() && this.text.startsWith('\x1b[')) {
      return `${this.text}${reset}`;
    }
    return this.text;
  }

  // Foreground colors
  get black(): string {
    return this.end().replace(/^/, reset).replace(`${reset}${reset}`, reset).replace(`${reset}`, `${black}`).replace(`${reset}${reset}`, reset);
  }
  get red(): string {
    return colorize(this.text, red);
  }
  get green(): string {
    return colorize(this.text, green);
  }
  get yellow(): string {
    return colorize(this.text, yellow);
  }
  get blue(): string {
    return colorize(this.text, blue);
  }
  get magenta(): string {
    return colorize(this.text, magenta);
  }
  get cyan(): string {
    return colorize(this.text, cyan);
  }
  get white(): string {
    return colorize(this.text, white);
  }

  // Background colors
  get bgBlack(): ColorUtils {
    this.apply(bgBlack);
    return this;
  }
  get bgRed(): ColorUtils {
    this.apply(bgRed);
    return this;
  }
  get bgGreen(): ColorUtils {
    this.apply(bgGreen);
    return this;
  }
  get bgYellow(): ColorUtils {
    this.apply(bgYellow);
    return this;
  }
  get bgBlue(): ColorUtils {
    this.apply(bgBlue);
    return this;
  }
  get bgMagenta(): ColorUtils {
    this.apply(bgMagenta);
    return this;
  }
  get bgCyan(): ColorUtils {
    this.apply(bgCyan);
    return this;
  }
  get bgWhite(): ColorUtils {
    this.apply(bgWhite);
    return this;
  }

  // Styles
  get bold(): ColorUtils {
    this.apply(bold);
    return this;
  }
  get dim(): ColorUtils {
    this.apply(dim);
    return this;
  }
  get italic(): ColorUtils {
    this.apply(italic);
    return this;
  }
  get underline(): ColorUtils {
    this.apply(underline);
    return this;
  }

  // Custom colors
  hex(hexColor: string): string {
    return colorize(this.text, hexToAnsi(hexColor));
  }

  rgb(r: number, g: number, b: number): string {
    return colorize(this.text, rgbToAnsi(r, g, b));
  }
}

/**
 * Create color utility for text
 *
 * @param text - Text to colorize
 * @returns Color utility instance
 *
 * @example
 * ```typescript
 * color.red('Error!');
 * color.green.bold('Success!');
 * ```
 */
export function color(text: string): ColorUtils {
  return new ColorUtils(text);
}

// Named color functions for convenience
export const colors = {
  black: (text: string) => colorize(text, black),
  red: (text: string) => colorize(text, red),
  green: (text: string) => colorize(text, green),
  yellow: (text: string) => colorize(text, yellow),
  blue: (text: string) => colorize(text, blue),
  magenta: (text: string) => colorize(text, magenta),
  cyan: (text: string) => colorize(text, cyan),
  white: (text: string) => colorize(text, white),
  gray: (text: string) => colorize(text, brightBlack),

  bgBlack: (text: string) => colorize(text, bgBlack),
  bgRed: (text: string) => colorize(text, bgRed),
  bgGreen: (text: string) => colorize(text, bgGreen),
  bgYellow: (text: string) => colorize(text, bgYellow),
  bgBlue: (text: string) => colorize(text, bgBlue),
  bgMagenta: (text: string) => colorize(text, bgMagenta),
  bgCyan: (text: string) => colorize(text, bgCyan),
  bgWhite: (text: string) => colorize(text, bgWhite),

  hex: (hexColor: string, text: string) => colorize(text, hexToAnsi(hexColor)),
  rgb: (r: number, g: number, b: number, text: string) => colorize(text, rgbToAnsi(r, g, b)),

  bold: (text: string) => colorize(text, bold),
  dim: (text: string) => colorize(text, dim),
  italic: (text: string) => colorize(text, italic),
  underline: (text: string) => colorize(text, underline),
};
