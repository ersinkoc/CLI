/**
 * Vendored pigment tests
 * Covers the zero-dependency chainable color API:
 * style chains, disabled mode, color-support detection,
 * parameterized styles (256/rgb/hex), standalone styles + compose.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPigment, detectColorSupport, styles, compose } from '../../src/utils/pigment.js';
import type { ColorSupport } from '../../src/types.js';

describe('pigment', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  // Helper: a pigment with styling forced on
  const on = () => createPigment({ forceColor: true });
  // Helper: a pigment with styling forced off
  const off = () => createPigment({ noColor: true });

  describe('createPigment enablement', () => {
    it('should apply styles when forced on', () => {
      const p = on();
      const out = p.red('err');
      expect(out).toContain('\x1b[31m');
      expect(out).toContain('err');
      expect(out.endsWith('\x1b[0m')).toBe(true);
    });

    it('should pass text through untouched when disabled', () => {
      const p = off();
      expect(p.red.bold.underline('plain')).toBe('plain');
    });

    it('should disable via level: 0', () => {
      const p = createPigment({ level: 0 });
      expect(p.green('x')).toBe('x');
    });

    it('should enable via level > 0', () => {
      const p = createPigment({ level: 1 });
      expect(p.green('x')).toContain('\x1b[32m');
    });

    it('should prefer noColor over forceColor', () => {
      const p = createPigment({ noColor: true, forceColor: true });
      expect(p.green('x')).toBe('x');
    });

    it('should fall back to terminal detection with no options', () => {
      process.env.FORCE_COLOR = '1';
      const p = createPigment();
      expect(p.green('x')).toContain('\x1b[32m');
    });

    it('should produce bare text from an empty chain when disabled', () => {
      const p = off();
      expect(p('bare')).toBe('bare');
    });

    it('should produce unstyled text from an empty chain when enabled', () => {
      const p = on();
      expect(p('bare')).toBe('bare');
    });
  });

  describe('chaining', () => {
    it('should accumulate multiple styles in order', () => {
      const out = on().red.bold('x');
      expect(out.startsWith('\x1b[31m\x1b[1m')).toBe(true);
      expect(out).toBe('\x1b[31m\x1b[1mx\x1b[0m');
    });

    it('should not mutate the root chain (each access returns new chain)', () => {
      const p = on();
      const red = p.red;
      const redBold = red.bold;
      // Original red chain is unaffected by later .bold
      expect(red('a')).toBe('\x1b[31ma\x1b[0m');
      expect(redBold('b')).toBe('\x1b[31m\x1b[1mb\x1b[0m');
      // Root chain still has no styles
      expect(p('c')).toBe('c');
    });

    it('should support deep chains', () => {
      const out = on().bgBlue.white.bold(' INFO ');
      expect(out.startsWith('\x1b[44m\x1b[37m\x1b[1m')).toBe(true);
      expect(out).toContain(' INFO ');
    });
  });

  describe('modifier styles', () => {
    const cases: Array<[string, string]> = [
      ['bold', '\x1b[1m'],
      ['dim', '\x1b[2m'],
      ['italic', '\x1b[3m'],
      ['underline', '\x1b[4m'],
      ['strikethrough', '\x1b[9m'],
      ['inverse', '\x1b[7m'],
      ['hidden', '\x1b[8m'],
      ['reset', '\x1b[0m'],
    ];

    for (const [name, code] of cases) {
      it(`should apply .${name}`, () => {
        const p = on() as unknown as Record<string, (t: string) => string>;
        const out = p[name]('x');
        expect(out.startsWith(code)).toBe(true);
        expect(out).toContain('x');
      });
    }
  });

  describe('foreground colors', () => {
    const cases: Array<[string, string]> = [
      ['black', '\x1b[30m'],
      ['red', '\x1b[31m'],
      ['green', '\x1b[32m'],
      ['yellow', '\x1b[33m'],
      ['blue', '\x1b[34m'],
      ['magenta', '\x1b[35m'],
      ['cyan', '\x1b[36m'],
      ['white', '\x1b[37m'],
      ['gray', '\x1b[90m'],
      ['grey', '\x1b[90m'],
    ];

    for (const [name, code] of cases) {
      it(`should apply .${name}`, () => {
        const p = on() as unknown as Record<string, (t: string) => string>;
        expect(p[name]('x').startsWith(code)).toBe(true);
      });
    }
  });

  describe('bright foreground variants', () => {
    const cases: Array<[string, string]> = [
      ['blackBright', '\x1b[90m'],
      ['redBright', '\x1b[91m'],
      ['greenBright', '\x1b[92m'],
      ['yellowBright', '\x1b[93m'],
      ['blueBright', '\x1b[94m'],
      ['magentaBright', '\x1b[95m'],
      ['cyanBright', '\x1b[96m'],
      ['whiteBright', '\x1b[97m'],
    ];

    for (const [name, code] of cases) {
      it(`should apply .${name}`, () => {
        const p = on() as unknown as Record<string, (t: string) => string>;
        expect(p[name]('x').startsWith(code)).toBe(true);
      });
    }
  });

  describe('background colors', () => {
    const cases: Array<[string, string]> = [
      ['bgBlack', '\x1b[40m'],
      ['bgRed', '\x1b[41m'],
      ['bgGreen', '\x1b[42m'],
      ['bgYellow', '\x1b[43m'],
      ['bgBlue', '\x1b[44m'],
      ['bgMagenta', '\x1b[45m'],
      ['bgCyan', '\x1b[46m'],
      ['bgWhite', '\x1b[47m'],
      ['bgGray', '\x1b[100m'],
      ['bgGrey', '\x1b[100m'],
    ];

    for (const [name, code] of cases) {
      it(`should apply .${name}`, () => {
        const p = on() as unknown as Record<string, (t: string) => string>;
        expect(p[name]('x').startsWith(code)).toBe(true);
      });
    }
  });

  describe('bright background variants', () => {
    const cases: Array<[string, string]> = [
      ['bgBlackBright', '\x1b[100m'],
      ['bgRedBright', '\x1b[101m'],
      ['bgGreenBright', '\x1b[102m'],
      ['bgYellowBright', '\x1b[103m'],
      ['bgBlueBright', '\x1b[104m'],
      ['bgMagentaBright', '\x1b[105m'],
      ['bgCyanBright', '\x1b[106m'],
      ['bgWhiteBright', '\x1b[107m'],
    ];

    for (const [name, code] of cases) {
      it(`should apply .${name}`, () => {
        const p = on() as unknown as Record<string, (t: string) => string>;
        expect(p[name]('x').startsWith(code)).toBe(true);
      });
    }
  });

  describe('parameterized styles', () => {
    it('should apply ansi256 foreground', () => {
      const out = on().ansi256(208)('x');
      expect(out.startsWith('\x1b[38;5;208m')).toBe(true);
    });

    it('should apply bgAnsi256 background', () => {
      const out = on().bgAnsi256(21)('x');
      expect(out.startsWith('\x1b[48;5;21m')).toBe(true);
    });

    it('should apply rgb foreground via 256-color conversion', () => {
      const out = on().rgb(255, 0, 0)('x');
      expect(out.startsWith('\x1b[38;5;')).toBe(true);
    });

    it('should apply bgRgb background', () => {
      const out = on().bgRgb(0, 255, 0)('x');
      expect(out.startsWith('\x1b[48;5;')).toBe(true);
    });

    it('should apply hex foreground (expands shorthand)', () => {
      const out = on().hex('#f60')('x');
      expect(out.startsWith('\x1b[38;5;')).toBe(true);
    });

    it('should apply bgHex background', () => {
      const out = on().bgHex('#00ff00')('x');
      expect(out.startsWith('\x1b[48;5;')).toBe(true);
    });

    it('should chain parameterized styles with modifiers', () => {
      const out = on().hex('#ff6600').bold.underline('x');
      expect(out.startsWith('\x1b[38;5;')).toBe(true);
      expect(out).toContain('\x1b[1m');
      expect(out).toContain('\x1b[4m');
    });

    it('should pass through when disabled', () => {
      const p = off();
      expect(p.ansi256(9)('x')).toBe('x');
      expect(p.bgAnsi256(9)('x')).toBe('x');
      expect(p.rgb(1, 2, 3)('x')).toBe('x');
      expect(p.bgRgb(1, 2, 3)('x')).toBe('x');
      expect(p.hex('#fff')('x')).toBe('x');
      expect(p.bgHex('#fff')('x')).toBe('x');
    });
  });

  describe('detectColorSupport', () => {
    it('should honor an explicit override level', () => {
      const support: ColorSupport = detectColorSupport(3);
      expect(support).toEqual({ level: 3, hasBasic: true, has256: true, has16m: true });
      expect(detectColorSupport(0).level).toBe(0);
      expect(detectColorSupport(1)).toEqual({
        level: 1,
        hasBasic: true,
        has256: false,
        has16m: false,
      });
      expect(detectColorSupport(2).has256).toBe(true);
      expect(detectColorSupport(2).has16m).toBe(false);
    });

    it('should report level 0 when colors are unsupported', () => {
      process.env.NO_COLOR = '1';
      delete process.env.FORCE_COLOR;
      delete process.env.COLORTERM;
      delete process.env.TERM;
      const support = detectColorSupport();
      expect(support.level).toBe(0);
      expect(support.hasBasic).toBe(false);
    });

    it('should detect truecolor via COLORTERM', () => {
      process.env.FORCE_COLOR = '1';
      process.env.COLORTERM = 'truecolor';
      expect(detectColorSupport().level).toBe(3);
    });

    it('should detect 24bit COLORTERM as level 3', () => {
      process.env.FORCE_COLOR = '1';
      process.env.COLORTERM = '24bit';
      expect(detectColorSupport().level).toBe(3);
    });

    it('should detect 256-color via TERM', () => {
      process.env.FORCE_COLOR = '1';
      delete process.env.COLORTERM;
      process.env.TERM = 'xterm-256color';
      expect(detectColorSupport().level).toBe(2);
    });

    it('should report level 1 for a plain TERM', () => {
      process.env.FORCE_COLOR = '1';
      delete process.env.COLORTERM;
      process.env.TERM = 'dumb';
      expect(detectColorSupport().level).toBe(1);
    });

    it('should report level 0 with no TERM and no TTY', () => {
      process.env.FORCE_COLOR = '1';
      delete process.env.COLORTERM;
      delete process.env.TERM;
      const isTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, 'isTTY', {
        value: undefined,
        configurable: true,
      });
      try {
        expect(detectColorSupport().level).toBe(0);
      } finally {
        Object.defineProperty(process.stdout, 'isTTY', {
          value: isTTY,
          configurable: true,
        });
      }
    });
  });

  describe('standalone styles map', () => {
    it('should expose all modifier, foreground, and background stylers', () => {
      const expected = [
        'bold',
        'dim',
        'italic',
        'underline',
        'strikethrough',
        'inverse',
        'hidden',
        'reset',
        'black',
        'red',
        'green',
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white',
        'gray',
        'grey',
        'bgBlack',
        'bgRed',
        'bgGreen',
        'bgYellow',
        'bgBlue',
        'bgMagenta',
        'bgCyan',
        'bgWhite',
        'bgGray',
        'bgGrey',
      ];
      for (const name of expected) {
        expect(typeof styles[name]).toBe('function');
      }
    });

    it('should wrap reset when supported', () => {
      process.env.FORCE_COLOR = '1';
      expect(styles.reset('x')).toBe('\x1b[0mx\x1b[0m');
    });

    it('should wrap text with the SGR code when supported', () => {
      process.env.FORCE_COLOR = '1';
      expect(styles.red('x')).toBe('\x1b[31mx\x1b[0m');
      expect(styles.bgGreen('x')).toBe('\x1b[42mx\x1b[0m');
    });

    it('should pass through when colors are unsupported', () => {
      process.env.NO_COLOR = '1';
      delete process.env.FORCE_COLOR;
      expect(styles.red('x')).toBe('x');
      expect(styles.bold('x')).toBe('x');
    });
  });

  describe('compose', () => {
    it('should apply stylers left-to-right', () => {
      process.env.FORCE_COLOR = '1';
      const red = compose(styles.red);
      expect(red('x')).toBe('\x1b[31mx\x1b[0m');
    });

    it('should nest composed output correctly', () => {
      process.env.FORCE_COLOR = '1';
      const redBold = compose(styles.bold, styles.red);
      // bold first (inner), red second (outer)
      expect(redBold('x')).toBe('\x1b[31m\x1b[1mx\x1b[0m\x1b[0m');
    });

    it('should return text unchanged with no stylers', () => {
      expect(compose()('x')).toBe('x');
    });
  });
});
