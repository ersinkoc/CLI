// ANSI utilities - explicit exports to avoid conflicts
export {
  reset,
  black, red, green, yellow, blue, magenta, cyan, white,
  brightBlack, brightRed, brightGreen, brightYellow, brightBlue, brightMagenta, brightCyan, brightWhite,
  bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite,
  bgBrightBlack, bgBrightRed, bgBrightGreen, bgBrightYellow, bgBrightBlue, bgBrightMagenta, bgBrightCyan, bgBrightWhite,
  bold, dim, italic, underline, blink, reverse, hidden, strikethrough,
  cursorUp as ansiCursorUp,
  cursorDown as ansiCursorDown,
  cursorForward, cursorBack,
  cursorNextLine, cursorPrevLine,
  cursorHorizontalAbsolute,
  cursorPosition,
  cursorShow, cursorHide,
  saveCursorPosition, restoreCursorPosition,
  clearScreen as ansiClearScreen,
  clearLine as ansiClearLine,
  clearLineDown, clearLineUp,
  isSupported,
  colorize,
  hexToAnsi,
  rgbToAnsi,
  ColorUtils,
  color,
  colors,
} from './ansi.js';

// Terminal utilities - explicit exports to avoid conflicts
export {
  getTerminalWidth,
  getTerminalHeight,
  getTerminalSize,
  clearScreen as clearTerminalScreen,
  clearLine as clearTerminalLine,
  cursorUp as cursorTerminalUp,
  cursorDown as cursorTerminalDown,
  cursorLeft,
  cursorRight,
  cursorTo,
  hideCursor,
  showCursor,
  isTTY,
  supportsUnicode,
  supportsColor,
  getTerminalType,
  isTerminalType,
  terminal,
} from './terminal.js';

// Levenshtein distance
export * from './levenshtein.js';

// Fuzzy search
export * from './fuzzy.js';
