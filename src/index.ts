// Main CLI factory and class
export { cli, CLIImplementation } from './cli.js';

// Types
export * from './types.js';

// Errors - rename to avoid conflicts
export {
  CLIError,
  UnknownCommandError,
  MissingArgumentError,
  InvalidOptionError,
  UnknownOptionError,
  ValidationError,
} from './errors/cli-error.js';

// Parser
export * from './parser/index.js';

// Command system
export { Command } from './command/command.js';
export { CommandRegistry } from './command/registry.js';
export { CommandRouter } from './command/router.js';

// Kernel
export { CLIKernelImpl as CLIKernel } from './kernel.js';

// Events
export { EventBus } from './events/index.js';

// Utilities - pick specific exports to avoid conflicts
export {
  isSupported,
  colorize,
  hexToAnsi,
  rgbToAnsi,
  color,
  colors,
} from './utils/ansi.js';
export {
  getTerminalWidth,
  getTerminalHeight,
  getTerminalSize,
  clearScreen,
  clearLine,
  cursorUp,
  cursorDown,
  cursorLeft,
  cursorRight,
  cursorTo,
  hideCursor,
  showCursor,
  isTTY,
  supportsColor,
  terminal,
} from './utils/terminal.js';
export {
  levenshtein,
  levenshteinNormalized,
  levenshteinSimilarity,
  findBestMatch,
  findAllMatches,
} from './utils/levenshtein.js';
export {
  fuzzyMatch,
  fuzzyFilter,
  fuzzySubset,
  fuzzyHighlight,
  fuzzyFindBest,
  fuzzySimilarity,
} from './utils/fuzzy.js';
