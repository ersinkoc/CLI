/**
 * Terminal utility functions
 * Provides terminal detection and manipulation
 *
 * @example
 * ```typescript
 * const width = terminal.getWidth();
 * const height = terminal.getHeight();
 * terminal.clear();
 * ```
 */

/**
 * Get terminal width
 *
 * @returns Terminal width in columns (default: 80)
 *
 * @example
 * ```typescript
 * const width = getTerminalWidth();
 * console.log(`Terminal is ${width} columns wide`);
 * ```
 */
export function getTerminalWidth(): number {
  return process.stdout.columns || 80;
}

/**
 * Get terminal height
 *
 * @returns Terminal height in rows (default: 24)
 *
 * @example
 * ```typescript
 * const height = getTerminalHeight();
 * console.log(`Terminal is ${height} rows tall`);
 * ```
 */
export function getTerminalHeight(): number {
  return process.stdout.rows || 24;
}

/**
 * Get terminal size
 *
 * @returns Terminal size as { width, height }
 *
 * @example
 * ```typescript
 * const { width, height } = getTerminalSize();
 * ```
 */
export function getTerminalSize(): { width: number; height: number } {
  return {
    width: getTerminalWidth(),
    height: getTerminalHeight(),
  };
}

/**
 * Clear the entire screen
 *
 * @example
 * ```typescript
 * clearScreen();
 * console.log('Fresh screen');
 * ```
 */
export function clearScreen(): void {
  // ANSI escape code to clear screen
  process.stdout.write('\x1b[2J');
  // Move cursor to top-left
  process.stdout.write('\x1b[H');
}

/**
 * Clear the current line
 *
 * @example
 * ```typescript
 * process.stdout.write('Loading...');
 * clearLine();
 * console.log('Done!');
 * ```
 */
export function clearLine(): void {
  process.stdout.write('\x1b[2K');
  // Move cursor to beginning of line
  process.stdout.write('\r');
}

/**
 * Move cursor up by n lines
 *
 * @param n - Number of lines to move up
 *
 * @example
 * ```typescript
 * console.log('Line 1');
 * console.log('Line 2');
 * cursorUp(1);
 * console.log('Overwritten');
 * ```
 */
export function cursorUp(n = 1): void {
  process.stdout.write(`\x1b[${n}A`);
}

/**
 * Move cursor down by n lines
 *
 * @param n - Number of lines to move down
 *
 * @example
 * ```typescript
 * cursorDown(5);
 * ```
 */
export function cursorDown(n = 1): void {
  process.stdout.write(`\x1b[${n}B`);
}

/**
 * Move cursor left by n columns
 *
 * @param n - Number of columns to move left
 *
 * @example
 * ```typescript
 * cursorLeft(10);
 * ```
 */
export function cursorLeft(n = 1): void {
  process.stdout.write(`\x1b[${n}D`);
}

/**
 * Move cursor right by n columns
 *
 * @param n - Number of columns to move right
 *
 * @example
 * ```typescript
 * cursorRight(5);
 * ```
 */
export function cursorRight(n = 1): void {
  process.stdout.write(`\x1b[${n}C`);
}

/**
 * Move cursor to absolute position
 *
 * @param row - Row (1-based)
 * @param col - Column (1-based)
 *
 * @example
 * ```typescript
 * cursorTo(1, 1); // Top-left corner
 * cursorTo(5, 10); // Row 5, column 10
 * ```
 */
export function cursorTo(row: number, col?: number): void {
  if (col === undefined) {
    process.stdout.write(`\x1b[${row}G`);
  } else {
    process.stdout.write(`\x1b[${row};${col}H`);
  }
}

/**
 * Hide cursor
 *
 * @example
 * ```typescript
 * hideCursor();
 * // ... draw UI ...
 * showCursor();
 * ```
 */
export function hideCursor(): void {
  process.stdout.write('\x1b[?25l');
}

/**
 * Show cursor
 *
 * @example
 * ```typescript
 * showCursor();
 * ```
 */
export function showCursor(): void {
  process.stdout.write('\x1b[?25h');
}

/**
 * Check if stdout is a TTY
 *
 * @returns true if running in a terminal
 *
 * @example
 * ```typescript
 * if (isTTY()) {
 *   console.log('Running in terminal');
 * } else {
 *   console.log('Output redirected');
 * }
 * ```
 */
export function isTTY(): boolean {
  return process.stdout.isTTY === true;
}

/**
 * Check if terminal supports Unicode
 *
 * @returns true if likely to support Unicode
 *
 * @example
 * ```typescript
 * if (supportsUnicode()) {
 *   console.log('✓ Success!');
 * } else {
 *   console.log('[OK] Success!');
 * }
 * ```
 */
export function supportsUnicode(): boolean {
  // Check platform (Windows has improved Unicode support in recent versions)
  if (process.platform === 'win32') {
    // Windows 10+ has good Unicode support
    const version = Number(process.env.OS_VER?.split('.')?.[0]) || 0;
    return version >= 10;
  }

  // Unix-like systems generally support Unicode
  return true;
}

/**
 * Check if terminal supports color
 *
 * @returns true if colors are supported
 *
 * @example
 * ```typescript
 * if (supportsColor()) {
 *   console.log('\x1b[32mGreen text\x1b[0m');
 * }
 * ```
 */
export function supportsColor(): boolean {
  // Check NO_COLOR standard (https://no-color.org/)
  if (process.env.NO_COLOR) {
    return false;
  }

  // Check FORCE_COLOR
  if (process.env.FORCE_COLOR) {
    return true;
  }

  // Check if we're in a TTY
  return process.stdout.isTTY === true;
}

/**
 * Get terminal type from environment
 *
 * @returns Terminal type (e.g., "xterm", "screen", "dumb")
 *
 * @example
 * ```typescript
 * const term = getTerminalType();
 * console.log(`Running in ${term}`);
 * ```
 */
export function getTerminalType(): string {
  return process.env.TERM || 'unknown';
}

/**
 * Check if running in specific terminal types
 *
 * @param types - Terminal types to check
 * @returns true if running in one of the specified terminals
 *
 * @example
 * ```typescript
 * if (isTerminalType(['xterm', 'xterm-256color'])) {
 *   // Use 256 colors
 * }
 * ```
 */
export function isTerminalType(types: string[]): boolean {
  const term = getTerminalType();
  return types.includes(term);
}

/**
 * Terminal utility object
 *
 * @example
 * ```typescript
 * terminal.clear();
 * console.log(`Width: ${terminal.width}`);
 * console.log(`Height: ${terminal.height}`);
 * ```
 */
export const terminal = {
  /** Terminal width in columns */
  get width(): number {
    return getTerminalWidth();
  },

  /** Terminal height in rows */
  get height(): number {
    return getTerminalHeight();
  },

  /** Clear entire screen */
  clear(): void {
    clearScreen();
  },

  /** Clear current line */
  clearLine(): void {
    clearLine();
  },

  /** Move cursor up */
  cursorUp(n?: number): void {
    cursorUp(n);
  },

  /** Move cursor down */
  cursorDown(n?: number): void {
    cursorDown(n);
  },

  /** Move cursor left */
  cursorLeft(n?: number): void {
    cursorLeft(n);
  },

  /** Move cursor right */
  cursorRight(n?: number): void {
    cursorRight(n);
  },

  /** Move cursor to position */
  cursorTo(row: number, col?: number): void {
    cursorTo(row, col);
  },

  /** Hide cursor */
  hideCursor(): void {
    hideCursor();
  },

  /** Show cursor */
  showCursor(): void {
    showCursor();
  },

  /** Check if TTY */
  get isTTY(): boolean {
    return isTTY();
  },

  /** Check if Unicode supported */
  get unicode(): boolean {
    return supportsUnicode();
  },

  /** Check if color supported */
  get color(): boolean {
    return supportsColor();
  },

  /** Get terminal type */
  get type(): string {
    return getTerminalType();
  },
};
