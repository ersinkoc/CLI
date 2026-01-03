/**
 * Terminal utilities tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
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
  supportsUnicode,
  supportsColor,
  getTerminalType,
  isTerminalType,
  terminal,
} from '../../src/utils/terminal.js';

describe('Terminal Utilities', () => {
  let writeSpy: ReturnType<typeof vi.spyOn>;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    process.env = originalEnv;
    writeSpy.mockRestore();
  });

  describe('getTerminalWidth', () => {
    it('should return terminal width', () => {
      const width = getTerminalWidth();
      expect(typeof width).toBe('number');
      expect(width).toBeGreaterThan(0);
    });

    it('should return default width when columns is undefined', () => {
      const originalColumns = process.stdout.columns;
      (process.stdout as any).columns = undefined;
      const width = getTerminalWidth();
      expect(width).toBe(80);
      process.stdout.columns = originalColumns;
    });
  });

  describe('getTerminalHeight', () => {
    it('should return terminal height', () => {
      const height = getTerminalHeight();
      expect(typeof height).toBe('number');
      expect(height).toBeGreaterThan(0);
    });

    it('should return default height when rows is undefined', () => {
      const originalRows = process.stdout.rows;
      (process.stdout as any).rows = undefined;
      const height = getTerminalHeight();
      expect(height).toBe(24);
      process.stdout.rows = originalRows;
    });
  });

  describe('getTerminalSize', () => {
    it('should return terminal size object', () => {
      const size = getTerminalSize();
      expect(size).toHaveProperty('width');
      expect(size).toHaveProperty('height');
      expect(typeof size.width).toBe('number');
      expect(typeof size.height).toBe('number');
    });
  });

  describe('clearScreen', () => {
    it('should write ANSI codes to clear screen', () => {
      clearScreen();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[2J');
      expect(writeSpy).toHaveBeenCalledWith('\x1b[H');
    });
  });

  describe('clearLine', () => {
    it('should write ANSI codes to clear line', () => {
      clearLine();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[2K');
      expect(writeSpy).toHaveBeenCalledWith('\r');
    });
  });

  describe('cursorUp', () => {
    it('should move cursor up with default count', () => {
      cursorUp();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[1A');
    });

    it('should move cursor up with custom count', () => {
      cursorUp(5);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[5A');
    });
  });

  describe('cursorDown', () => {
    it('should move cursor down with default count', () => {
      cursorDown();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[1B');
    });

    it('should move cursor down with custom count', () => {
      cursorDown(3);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[3B');
    });
  });

  describe('cursorLeft', () => {
    it('should move cursor left with default count', () => {
      cursorLeft();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[1D');
    });

    it('should move cursor left with custom count', () => {
      cursorLeft(10);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[10D');
    });
  });

  describe('cursorRight', () => {
    it('should move cursor right with default count', () => {
      cursorRight();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[1C');
    });

    it('should move cursor right with custom count', () => {
      cursorRight(7);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[7C');
    });
  });

  describe('cursorTo', () => {
    it('should move cursor to column only', () => {
      cursorTo(10);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[10G');
    });

    it('should move cursor to row and column', () => {
      cursorTo(5, 20);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[5;20H');
    });
  });

  describe('hideCursor', () => {
    it('should write ANSI code to hide cursor', () => {
      hideCursor();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[?25l');
    });
  });

  describe('showCursor', () => {
    it('should write ANSI code to show cursor', () => {
      showCursor();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[?25h');
    });
  });

  describe('isTTY', () => {
    it('should return boolean', () => {
      expect(typeof isTTY()).toBe('boolean');
    });
  });

  describe('supportsUnicode', () => {
    it('should return boolean', () => {
      expect(typeof supportsUnicode()).toBe('boolean');
    });

    it('should check platform for unicode support', () => {
      const result = supportsUnicode();
      expect(typeof result).toBe('boolean');
    });

    it('should return true for Unix-like platforms', () => {
      const originalPlatform = process.platform;
      // Mock platform for Unix-like systems
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true,
      });
      expect(supportsUnicode()).toBe(true);
      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('supportsColor', () => {
    it('should return boolean', () => {
      expect(typeof supportsColor()).toBe('boolean');
    });

    it('should return false when NO_COLOR is set', () => {
      delete process.env.FORCE_COLOR;
      process.env.NO_COLOR = '1';
      expect(supportsColor()).toBe(false);
      delete process.env.NO_COLOR;
    });

    it('should return true when FORCE_COLOR is set', () => {
      delete process.env.NO_COLOR;
      process.env.FORCE_COLOR = '1';
      expect(supportsColor()).toBe(true);
      delete process.env.FORCE_COLOR;
    });

    it('should prioritize NO_COLOR over FORCE_COLOR', () => {
      process.env.NO_COLOR = '1';
      process.env.FORCE_COLOR = '1';
      expect(supportsColor()).toBe(false);
      delete process.env.NO_COLOR;
      delete process.env.FORCE_COLOR;
    });
  });

  describe('getTerminalType', () => {
    it('should return string', () => {
      expect(typeof getTerminalType()).toBe('string');
    });

    it('should return "unknown" when TERM is not set', () => {
      const originalTerm = process.env.TERM;
      delete process.env.TERM;
      expect(getTerminalType()).toBe('unknown');
      process.env.TERM = originalTerm;
    });

    it('should return TERM value when set', () => {
      const originalTerm = process.env.TERM;
      process.env.TERM = 'xterm-256color';
      expect(getTerminalType()).toBe('xterm-256color');
      process.env.TERM = originalTerm;
    });
  });

  describe('isTerminalType', () => {
    it('should return boolean', () => {
      expect(isTerminalType(['xterm', 'screen'])).toBeTypeOf('boolean');
    });

    it('should return true when current terminal matches', () => {
      const originalTerm = process.env.TERM;
      process.env.TERM = 'xterm';
      expect(isTerminalType(['xterm', 'screen'])).toBe(true);
      process.env.TERM = originalTerm;
    });

    it('should return false when current terminal does not match', () => {
      const originalTerm = process.env.TERM;
      process.env.TERM = 'dumb';
      expect(isTerminalType(['xterm', 'screen'])).toBe(false);
      process.env.TERM = originalTerm;
    });
  });

  describe('terminal object', () => {
    it('should expose width getter', () => {
      expect(terminal.width).toBeTypeOf('number');
    });

    it('should expose height getter', () => {
      expect(terminal.height).toBeTypeOf('number');
    });

    it('should expose isTTY getter', () => {
      expect(terminal.isTTY).toBeTypeOf('boolean');
    });

    it('should expose unicode getter', () => {
      expect(terminal.unicode).toBeTypeOf('boolean');
    });

    it('should expose color getter', () => {
      expect(terminal.color).toBeTypeOf('boolean');
    });

    it('should expose type getter', () => {
      expect(terminal.type).toBeTypeOf('string');
    });

    it('should have clear method', () => {
      terminal.clear();
      expect(writeSpy).toHaveBeenCalled();
    });

    it('should have clearLine method', () => {
      terminal.clearLine();
      expect(writeSpy).toHaveBeenCalled();
    });

    it('should have cursor methods', () => {
      expect(terminal.cursorUp).toBeTypeOf('function');
      expect(terminal.cursorDown).toBeTypeOf('function');
      expect(terminal.cursorLeft).toBeTypeOf('function');
      expect(terminal.cursorRight).toBeTypeOf('function');
      expect(terminal.cursorTo).toBeTypeOf('function');
    });

    it('should call cursorUp through terminal object', () => {
      terminal.cursorUp(2);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[2A');
    });

    it('should call cursorDown through terminal object', () => {
      terminal.cursorDown(2);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[2B');
    });

    it('should call cursorLeft through terminal object', () => {
      terminal.cursorLeft(2);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[2D');
    });

    it('should call cursorRight through terminal object', () => {
      terminal.cursorRight(2);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[2C');
    });

    it('should call cursorTo through terminal object', () => {
      terminal.cursorTo(3, 5);
      expect(writeSpy).toHaveBeenCalledWith('\x1b[3;5H');
    });

    it('should call hideCursor through terminal object', () => {
      terminal.hideCursor();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[?25l');
    });

    it('should call showCursor through terminal object', () => {
      terminal.showCursor();
      expect(writeSpy).toHaveBeenCalledWith('\x1b[?25h');
    });
  });
});
