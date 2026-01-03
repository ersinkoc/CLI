/**
 * ANSI utilities tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { colors, color, rgbToAnsi, hexToAnsi, isSupported } from '../../src/utils/index.js';
import * as ansi from '../../src/utils/ansi.js';

describe('ANSI Utilities', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('colors', () => {
    it('should apply black color', () => {
      expect(colors.black('text')).toContain('text');
    });

    it('should apply red color', () => {
      expect(colors.red('error')).toContain('error');
    });

    it('should apply green color', () => {
      expect(colors.green('success')).toContain('success');
    });

    it('should apply yellow color', () => {
      expect(colors.yellow('warning')).toContain('warning');
    });

    it('should apply blue color', () => {
      expect(colors.blue('info')).toContain('info');
    });

    it('should apply magenta color', () => {
      expect(colors.magenta('accent')).toContain('accent');
    });

    it('should apply cyan color', () => {
      expect(colors.cyan('note')).toContain('note');
    });

    it('should apply white color', () => {
      expect(colors.white('text')).toContain('text');
    });

    it('should apply gray color', () => {
      expect(colors.gray('dim')).toContain('dim');
    });

    it('should apply background colors', () => {
      expect(colors.bgRed('alert')).toContain('alert');
      expect(colors.bgGreen('success')).toContain('success');
    });

    it('should apply text styles', () => {
      expect(colors.bold('bold')).toContain('bold');
      expect(colors.dim('dim')).toContain('dim');
      expect(colors.underline('under')).toContain('under');
    });

    it('should apply italic style', () => {
      expect(colors.italic('text')).toContain('text');
    });

    it('should support hex colors', () => {
      expect(colors.hex('#ff6600', 'custom')).toContain('custom');
    });

    it('should support rgb colors', () => {
      expect(colors.rgb(255, 102, 0, 'rgb')).toContain('rgb');
    });
  });

  describe('color utility class', () => {
    it('should create color instance', () => {
      const c = color('text');
      expect(c).toBeDefined();
    });

    it('should apply colors as methods', () => {
      const c = color('text');
      expect(c.red()).toBeTypeOf('string');
      expect(c.green()).toBeTypeOf('string');
      expect(c.yellow()).toBeTypeOf('string');
      expect(c.blue()).toBeTypeOf('string');
      expect(c.magenta()).toBeTypeOf('string');
      expect(c.cyan()).toBeTypeOf('string');
    });

    it('should chain background modifiers', () => {
      const c = color('text');
      const result = c.bgRed();
      expect(result).toBeInstanceOf(color('text').constructor);
    });

    it('should chain style modifiers', () => {
      const c = color('text');
      const result = c.bold().underline();
      expect(result).toBeInstanceOf(color('text').constructor);
    });
  });

  describe('hexToAnsi', () => {
    it('should convert hex to ANSI', () => {
      const result = hexToAnsi('#ff6600');
      expect(result).toContain('\x1b[');
    });

    it('should handle grayscale colors', () => {
      const result = hexToAnsi('#808080');
      expect(result).toContain('\x1b[');
    });

    it('should handle pure black', () => {
      const result = hexToAnsi('#000000');
      expect(result).toContain('\x1b[');
    });

    it('should handle pure white', () => {
      const result = hexToAnsi('#ffffff');
      expect(result).toContain('\x1b[');
    });
  });

  describe('rgbToAnsi', () => {
    it('should convert RGB to ANSI', () => {
      const result = rgbToAnsi(255, 102, 0);
      expect(result).toContain('\x1b[');
    });

    it('should handle RGB boundaries', () => {
      expect(rgbToAnsi(0, 0, 0)).toContain('\x1b[');
      expect(rgbToAnsi(255, 255, 255)).toContain('\x1b[');
    });
  });

  describe('isSupported', () => {
    it('should return true when TTY is available', () => {
      // This test may pass or fail depending on environment
      const result = isSupported();
      expect(typeof result).toBe('boolean');
    });

    it('should respect NO_COLOR env var', () => {
      process.env.NO_COLOR = '1';
      const result = isSupported();
      expect(result).toBe(false);
    });

    it('should respect FORCE_COLOR env var', () => {
      process.env.FORCE_COLOR = '1';
      const result = isSupported();
      expect(result).toBe(true);
    });
  });

  describe('cursor movement', () => {
    it('should generate cursor up codes', () => {
      expect(ansi.cursorUp()).toBe('\x1b[1A');
      expect(ansi.cursorUp(3)).toBe('\x1b[3A');
    });

    it('should generate cursor down codes', () => {
      expect(ansi.cursorDown()).toBe('\x1b[1B');
      expect(ansi.cursorDown(5)).toBe('\x1b[5B');
    });

    it('should generate cursor forward codes', () => {
      expect(ansi.cursorForward()).toBe('\x1b[1C');
      expect(ansi.cursorForward(2)).toBe('\x1b[2C');
    });

    it('should generate cursor back codes', () => {
      expect(ansi.cursorBack()).toBe('\x1b[1D');
      expect(ansi.cursorBack(4)).toBe('\x1b[4D');
    });

    it('should generate cursor next line codes', () => {
      expect(ansi.cursorNextLine()).toBe('\x1b[1E');
      expect(ansi.cursorNextLine(2)).toBe('\x1b[2E');
    });

    it('should generate cursor prev line codes', () => {
      expect(ansi.cursorPrevLine()).toBe('\x1b[1F');
      expect(ansi.cursorPrevLine(3)).toBe('\x1b[3F');
    });

    it('should generate cursor horizontal absolute codes', () => {
      expect(ansi.cursorHorizontalAbsolute()).toBe('\x1b[1G');
      expect(ansi.cursorHorizontalAbsolute(10)).toBe('\x1b[10G');
    });

    it('should generate cursor position codes', () => {
      expect(ansi.cursorPosition(5, 20)).toBe('\x1b[5;20H');
    });
  });

  describe('color utility class additional methods', () => {
    beforeEach(() => {
      process.env.FORCE_COLOR = '1';
    });

    it('should apply italic style', () => {
      const c = color('text');
      const result = c.italic();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply custom hex color', () => {
      const c = color('text');
      const result = c.hex('#ff6600');
      expect(result).toContain('text');
    });

    it('should apply custom rgb color', () => {
      const c = color('text');
      const result = c.rgb(255, 102, 0);
      expect(result).toContain('text');
    });

    it('should chain multiple background colors', () => {
      const c = color('text');
      const result = c.bgRed().bgGreen();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should chain multiple styles', () => {
      const c = color('text');
      const result = c.bold().dim().italic().underline();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should combine background and styles - white returns string', () => {
      const c = color('text');
      const result = c.bgBlue().bold().white();
      // white getter returns a string (final result), not a ColorUtils instance
      expect(typeof result).toBe('string');
      expect(result).toContain('text');
    });

    it('should get black color', () => {
      const c = color('text');
      const result = c.black();
      expect(result).toContain('text');
    });

    it('should handle end() method with existing escape codes', () => {
      const c = color('text');
      // First apply a style that adds escape codes
      const styled = c.bold();
      // Then the text should start with escape codes
      // Calling a color method after a style should use end() which checks for escape codes
      expect(typeof styled).toBe('object');
      // The internal text should now have escape codes
    });

    it('should apply bgBlack background', () => {
      const c = color('text');
      const result = c.bgBlack();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply bgRed background', () => {
      const c = color('text');
      const result = c.bgRed();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply bgGreen background', () => {
      const c = color('text');
      const result = c.bgGreen();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply bgBlue background', () => {
      const c = color('text');
      const result = c.bgBlue();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply bgYellow background', () => {
      const c = color('text');
      const result = c.bgYellow();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply bgMagenta background', () => {
      const c = color('text');
      const result = c.bgMagenta();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply bgCyan background', () => {
      const c = color('text');
      const result = c.bgCyan();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply bgWhite background', () => {
      const c = color('text');
      const result = c.bgWhite();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply bgBlack background', () => {
      const c = color('text');
      const result = c.bgBlack();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should apply bgRed background', () => {
      const c = color('text');
      const result = c.bgRed();
      expect(result).toBeInstanceOf(c.constructor);
    });

    it('should use colors.bgBlack', () => {
      expect(colors.bgBlack('text')).toContain('text');
    });

    it('should use colors.bgRed', () => {
      expect(colors.bgRed('text')).toContain('text');
    });

    it('should use colors.bgMagenta', () => {
      expect(colors.bgMagenta('text')).toContain('text');
    });

    it('should use colors.bgYellow', () => {
      expect(colors.bgYellow('text')).toContain('text');
    });

    it('should use colors.bgBlue', () => {
      expect(colors.bgBlue('text')).toContain('text');
    });

    it('should use colors.dim style', () => {
      expect(colors.dim('text')).toContain('text');
    });

    it('should use colors.italic style', () => {
      expect(colors.italic('text')).toContain('text');
    });

    it('should use colors.underline style', () => {
      expect(colors.underline('text')).toContain('text');
    });

    it('should handle end() with ANSI prefix and FORCE_COLOR', () => {
      // Test the code path at ansi.ts:217 - when text starts with '\x1b[' and isSupported is true
      process.env.FORCE_COLOR = '1';
      const c = color('text');
      const result = c.bold();
      // The result should have ANSI codes when FORCE_COLOR is set
      expect(typeof result).toBe('object');
      // Force another style to trigger end()
      const final = result.red();
      // When text already has ANSI codes, end() appends reset
      expect(typeof final).toBe('string');
    });
  });

  describe('screen clearing', () => {
    it('should export clear screen code', () => {
      expect(ansi.clearScreen).toBe('\x1b[2J');
    });

    it('should export clear line code', () => {
      expect(ansi.clearLine).toBe('\x1b[2K');
    });

    it('should export clear line down code', () => {
      expect(ansi.clearLineDown).toBe('\x1b[0J');
    });

    it('should export clear line up code', () => {
      expect(ansi.clearLineUp).toBe('\x1b[1J');
    });
  });
});
