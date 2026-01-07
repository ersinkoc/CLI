import type {
  CLIPlugin,
  CLIKernel,
  PromptUtils,
  PromptInputOptions,
  PromptConfirmOptions,
  PromptSelectOptions,
  PromptMultiSelectOptions,
  PromptAutocompleteOptions,
  PromptNumberOptions,
  PromptDateOptions,
  PromptEditorOptions,
  PromptWizardOptions,
  PromptSelectOption,
} from '../../../types.js';
import { colors } from '../../../utils/ansi.js';
import { fuzzyFilter } from '../../../utils/fuzzy.js';

/**
 * Prompt plugin options
 */
export interface PromptPluginOptions {
  /** Default prompt prefix */
  prefix?: string;
  /** Theme colors */
  theme?: {
    primary?: string;
    success?: string;
    error?: string;
    muted?: string;
  };
}

/**
 * Read a single keypress from stdin
 */
async function readKey(): Promise<{ key: string; ctrl: boolean; shift: boolean; raw: string }> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onData = (data: string) => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(wasRaw);
      stdin.pause();

      const ctrl = data.charCodeAt(0) < 32 && data !== '\r' && data !== '\n';
      const shift = data !== data.toLowerCase();

      // Handle special keys
      let key = data;
      if (data === '\x1b[A') key = 'up';
      else if (data === '\x1b[B') key = 'down';
      else if (data === '\x1b[C') key = 'right';
      else if (data === '\x1b[D') key = 'left';
      else if (data === '\r' || data === '\n') key = 'enter';
      else if (data === '\x7f' || data === '\b') key = 'backspace';
      else if (data === '\x1b') key = 'escape';
      else if (data === '\t') key = 'tab';
      else if (data === ' ') key = 'space';
      else if (data === '\x03') key = 'ctrl+c';

      resolve({ key, ctrl, shift, raw: data });
    };

    stdin.on('data', onData);
  });
}

/**
 * Read a line of input
 */
async function readLine(options: {
  hidden?: boolean;
  default?: string;
  validate?: (value: string) => boolean | string;
}): Promise<string> {
  const stdin = process.stdin;
  const stdout = process.stdout;

  let value = '';
  let cursorPos = 0;

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  return new Promise((resolve, reject) => {
    const render = () => {
      // Clear line and write value
      stdout.write('\r\x1b[K');
      if (options.hidden) {
        stdout.write('*'.repeat(value.length));
      } else {
        stdout.write(value);
      }
      // Position cursor
      if (cursorPos < value.length) {
        stdout.write(`\x1b[${value.length - cursorPos}D`);
      }
    };

    const onData = (data: string) => {
      // Handle special keys
      if (data === '\x03') {
        // Ctrl+C
        stdin.removeListener('data', onData);
        stdin.setRawMode(false);
        stdin.pause();
        reject(new Error('User cancelled'));
        return;
      }

      if (data === '\r' || data === '\n') {
        // Enter
        stdin.removeListener('data', onData);
        stdin.setRawMode(false);
        stdin.pause();
        stdout.write('\n');

        const finalValue = value || options.default || '';

        // Validate
        if (options.validate) {
          const result = options.validate(finalValue);
          if (result !== true) {
            stdout.write(colors.red(typeof result === 'string' ? result : 'Invalid input') + '\n');
            resolve(readLine(options));
            return;
          }
        }

        resolve(finalValue);
        return;
      }

      if (data === '\x7f' || data === '\b') {
        // Backspace
        if (cursorPos > 0) {
          value = value.slice(0, cursorPos - 1) + value.slice(cursorPos);
          cursorPos--;
          render();
        }
        return;
      }

      if (data === '\x1b[D') {
        // Left arrow
        if (cursorPos > 0) {
          cursorPos--;
          stdout.write('\x1b[D');
        }
        return;
      }

      if (data === '\x1b[C') {
        // Right arrow
        if (cursorPos < value.length) {
          cursorPos++;
          stdout.write('\x1b[C');
        }
        return;
      }

      if (data === '\x1b[H' || data === '\x01') {
        // Home or Ctrl+A
        cursorPos = 0;
        render();
        return;
      }

      if (data === '\x1b[F' || data === '\x05') {
        // End or Ctrl+E
        cursorPos = value.length;
        render();
        return;
      }

      // Ignore other escape sequences
      if (data.startsWith('\x1b')) {
        return;
      }

      // Regular character
      if (data.length === 1 && data.charCodeAt(0) >= 32) {
        value = value.slice(0, cursorPos) + data + value.slice(cursorPos);
        cursorPos++;
        render();
      }
    };

    stdin.on('data', onData);
    render();
  });
}

/**
 * Prompt implementation
 */
class PromptImpl implements PromptUtils {
  private prefix: string;

  constructor(options: PromptPluginOptions = {}) {
    this.prefix = options.prefix || colors.cyan('?');
  }

  /**
   * Text input prompt
   */
  async input(options: PromptInputOptions): Promise<string> {
    const defaultHint = options.default ? colors.gray(` (${options.default})`) : '';
    process.stdout.write(`${this.prefix} ${options.message}${defaultHint} `);

    return readLine({
      default: options.default,
      validate: options.validate,
    });
  }

  /**
   * Password input prompt (hidden)
   */
  async password(options: PromptInputOptions): Promise<string> {
    process.stdout.write(`${this.prefix} ${options.message} `);

    return readLine({
      hidden: true,
      validate: options.validate,
    });
  }

  /**
   * Yes/No confirmation prompt
   */
  async confirm(options: PromptConfirmOptions): Promise<boolean> {
    const defaultHint = options.default !== undefined
      ? colors.gray(` (${options.default ? 'Y/n' : 'y/N'})`)
      : colors.gray(' (y/n)');

    process.stdout.write(`${this.prefix} ${options.message}${defaultHint} `);

    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    return new Promise((resolve, reject) => {
      const onData = (data: string) => {
        stdin.removeListener('data', onData);
        stdin.setRawMode(false);
        stdin.pause();

        if (data === '\x03') {
          reject(new Error('User cancelled'));
          return;
        }

        const char = data.toLowerCase();
        let result: boolean;

        if (char === 'y') {
          result = true;
          process.stdout.write(colors.green('Yes') + '\n');
        } else if (char === 'n') {
          result = false;
          process.stdout.write(colors.red('No') + '\n');
        } else if (char === '\r' || char === '\n') {
          result = options.default ?? false;
          process.stdout.write((result ? colors.green('Yes') : colors.red('No')) + '\n');
        } else {
          // Invalid, try again
          process.stdout.write('\n');
          resolve(this.confirm(options));
          return;
        }

        resolve(result);
      };

      stdin.on('data', onData);
    });
  }

  /**
   * Single selection from list
   */
  async select<T>(options: PromptSelectOptions<T>): Promise<T> {
    const choices = options.choices.map((c): PromptSelectOption<T> => {
      if (typeof c === 'string') {
        return { value: c as unknown as T, label: c };
      }
      return c as PromptSelectOption<T>;
    });

    let selectedIndex = 0;

    // Find default
    if (options.default !== undefined) {
      const idx = choices.findIndex((c) => c.value === options.default);
      if (idx >= 0) selectedIndex = idx;
    }

    const stdin = process.stdin;
    const stdout = process.stdout;

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const render = () => {
      // Move cursor up and clear
      stdout.write(`\x1b[${choices.length}A`);

      for (let i = 0; i < choices.length; i++) {
        stdout.write('\x1b[2K'); // Clear line
        const choice = choices[i];
        const prefix = i === selectedIndex ? colors.cyan('> ') : '  ';
        const label = i === selectedIndex ? colors.cyan(choice.label) : choice.label;
        const hint = choice.hint ? colors.gray(` - ${choice.hint}`) : '';
        stdout.write(`${prefix}${label}${hint}\n`);
      }
    };

    // Initial render
    stdout.write(`${this.prefix} ${options.message}\n`);
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      const prefix = i === selectedIndex ? colors.cyan('> ') : '  ';
      const label = i === selectedIndex ? colors.cyan(choice.label) : choice.label;
      const hint = choice.hint ? colors.gray(` - ${choice.hint}`) : '';
      stdout.write(`${prefix}${label}${hint}\n`);
    }

    return new Promise((resolve, reject) => {
      const onData = (data: string) => {
        if (data === '\x03') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();
          reject(new Error('User cancelled'));
          return;
        }

        if (data === '\x1b[A' || data === 'k') {
          // Up
          selectedIndex = Math.max(0, selectedIndex - 1);
          render();
          return;
        }

        if (data === '\x1b[B' || data === 'j') {
          // Down
          selectedIndex = Math.min(choices.length - 1, selectedIndex + 1);
          render();
          return;
        }

        if (data === '\r' || data === '\n') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();

          // Clear and show selected
          stdout.write(`\x1b[${choices.length}A`);
          for (let i = 0; i < choices.length; i++) {
            stdout.write('\x1b[2K\n');
          }
          stdout.write(`\x1b[${choices.length}A`);
          stdout.write(colors.green(`  ${choices[selectedIndex].label}`) + '\n');

          resolve(choices[selectedIndex].value);
        }
      };

      stdin.on('data', onData);
    });
  }

  /**
   * Multiple selection from list
   */
  async multiselect<T>(options: PromptMultiSelectOptions<T>): Promise<T[]> {
    const choices = options.choices.map((c): PromptSelectOption<T> & { selected: boolean } => {
      if (typeof c === 'string') {
        return { value: c as unknown as T, label: c, selected: false };
      }
      return { ...(c as PromptSelectOption<T>), selected: false };
    });

    let cursorIndex = 0;

    const stdin = process.stdin;
    const stdout = process.stdout;

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const render = () => {
      stdout.write(`\x1b[${choices.length}A`);

      for (let i = 0; i < choices.length; i++) {
        stdout.write('\x1b[2K');
        const choice = choices[i];
        const cursor = i === cursorIndex ? colors.cyan('>') : ' ';
        const checkbox = choice.selected ? colors.green('[x]') : '[ ]';
        const label = i === cursorIndex ? colors.cyan(choice.label) : choice.label;
        const hint = choice.hint ? colors.gray(` - ${choice.hint}`) : '';
        stdout.write(`${cursor} ${checkbox} ${label}${hint}\n`);
      }
    };

    // Initial render
    const minHint = options.min ? `min: ${options.min}` : '';
    const maxHint = options.max ? `max: ${options.max}` : '';
    const rangeHint = minHint || maxHint ? colors.gray(` (${[minHint, maxHint].filter(Boolean).join(', ')})`) : '';

    stdout.write(`${this.prefix} ${options.message}${rangeHint} ${colors.gray('(space to select, enter to confirm)')}\n`);
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      const cursor = i === cursorIndex ? colors.cyan('>') : ' ';
      const checkbox = choice.selected ? colors.green('[x]') : '[ ]';
      const label = i === cursorIndex ? colors.cyan(choice.label) : choice.label;
      const hint = choice.hint ? colors.gray(` - ${choice.hint}`) : '';
      stdout.write(`${cursor} ${checkbox} ${label}${hint}\n`);
    }

    return new Promise((resolve, reject) => {
      const onData = (data: string) => {
        if (data === '\x03') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();
          reject(new Error('User cancelled'));
          return;
        }

        if (data === '\x1b[A' || data === 'k') {
          cursorIndex = Math.max(0, cursorIndex - 1);
          render();
          return;
        }

        if (data === '\x1b[B' || data === 'j') {
          cursorIndex = Math.min(choices.length - 1, cursorIndex + 1);
          render();
          return;
        }

        if (data === ' ') {
          choices[cursorIndex].selected = !choices[cursorIndex].selected;
          render();
          return;
        }

        if (data === '\r' || data === '\n') {
          const selected = choices.filter((c) => c.selected);

          // Validate min/max
          if (options.min && selected.length < options.min) {
            stdout.write(colors.red(`\n  Select at least ${options.min} items\n`));
            return;
          }
          if (options.max && selected.length > options.max) {
            stdout.write(colors.red(`\n  Select at most ${options.max} items\n`));
            return;
          }
          if (options.required && selected.length === 0) {
            stdout.write(colors.red('\n  Selection required\n'));
            return;
          }

          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();

          // Clear and show selected
          stdout.write(`\x1b[${choices.length}A`);
          for (let i = 0; i < choices.length; i++) {
            stdout.write('\x1b[2K\n');
          }
          stdout.write(`\x1b[${choices.length}A`);
          stdout.write(colors.green(`  ${selected.map((c) => c.label).join(', ')}`) + '\n');

          resolve(selected.map((c) => c.value));
        }
      };

      stdin.on('data', onData);
    });
  }

  /**
   * Autocomplete with fuzzy search
   */
  async autocomplete<T>(options: PromptAutocompleteOptions<T>): Promise<T> {
    let query = '';
    let selectedIndex = 0;
    const limit = options.limit || 10;

    const stdin = process.stdin;
    const stdout = process.stdout;

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const getFiltered = (): T[] => {
      if (!query) return options.choices.slice(0, limit);
      const stringChoices = options.choices.map((c) => String(c));
      const matches = fuzzyFilter(query, stringChoices);
      return matches.slice(0, limit).map((m) => options.choices[stringChoices.indexOf(m.value)]);
    };

    let filtered = getFiltered();

    const render = () => {
      // Clear previous
      stdout.write(`\x1b[${filtered.length + 1}A`);

      // Query line
      stdout.write('\x1b[2K');
      stdout.write(`${this.prefix} ${colors.gray('Search:')} ${query}\n`);

      // Results
      for (let i = 0; i < limit; i++) {
        stdout.write('\x1b[2K');
        if (i < filtered.length) {
          const item = String(filtered[i]);
          const prefix = i === selectedIndex ? colors.cyan('> ') : '  ';
          const label = i === selectedIndex ? colors.cyan(item) : item;
          stdout.write(`${prefix}${label}\n`);
        } else {
          stdout.write('\n');
        }
      }
    };

    // Initial render
    stdout.write(`${this.prefix} ${colors.gray('Search:')} ${query}\n`);
    for (let i = 0; i < limit; i++) {
      if (i < filtered.length) {
        const item = String(filtered[i]);
        const prefix = i === selectedIndex ? colors.cyan('> ') : '  ';
        const label = i === selectedIndex ? colors.cyan(item) : item;
        stdout.write(`${prefix}${label}\n`);
      } else {
        stdout.write('\n');
      }
    }

    return new Promise((resolve, reject) => {
      const onData = (data: string) => {
        if (data === '\x03') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();
          reject(new Error('User cancelled'));
          return;
        }

        if (data === '\x1b[A') {
          selectedIndex = Math.max(0, selectedIndex - 1);
          render();
          return;
        }

        if (data === '\x1b[B') {
          selectedIndex = Math.min(filtered.length - 1, selectedIndex + 1);
          render();
          return;
        }

        if (data === '\x7f' || data === '\b') {
          query = query.slice(0, -1);
          filtered = getFiltered();
          selectedIndex = 0;
          render();
          return;
        }

        if (data === '\r' || data === '\n') {
          if (filtered.length === 0) return;

          stdin.removeListener('data', onData);
          stdin.setRawMode(false);
          stdin.pause();

          // Clear
          stdout.write(`\x1b[${limit + 1}A`);
          for (let i = 0; i <= limit; i++) {
            stdout.write('\x1b[2K\n');
          }
          stdout.write(`\x1b[${limit + 1}A`);
          stdout.write(colors.green(`  ${String(filtered[selectedIndex])}`) + '\n');

          resolve(filtered[selectedIndex]);
          return;
        }

        // Regular character
        if (data.length === 1 && data.charCodeAt(0) >= 32) {
          query += data;
          filtered = getFiltered();
          selectedIndex = 0;
          render();
        }
      };

      stdin.on('data', onData);
    });
  }

  /**
   * Number input with min/max/step validation
   */
  async number(options: PromptNumberOptions): Promise<number> {
    const hints: string[] = [];
    if (options.min !== undefined) hints.push(`min: ${options.min}`);
    if (options.max !== undefined) hints.push(`max: ${options.max}`);
    if (options.step !== undefined) hints.push(`step: ${options.step}`);
    const defaultHint = options.default !== undefined ? ` (${options.default})` : '';
    const rangeHint = hints.length > 0 ? colors.gray(` [${hints.join(', ')}]`) : '';

    process.stdout.write(`${this.prefix} ${options.message}${rangeHint}${colors.gray(defaultHint)} `);

    const value = await readLine({
      default: options.default?.toString(),
      validate: (v) => {
        const num = parseFloat(v);
        if (isNaN(num)) return 'Please enter a valid number';
        if (options.min !== undefined && num < options.min) {
          return `Number must be at least ${options.min}`;
        }
        if (options.max !== undefined && num > options.max) {
          return `Number must be at most ${options.max}`;
        }
        if (options.step !== undefined && (num - (options.min || 0)) % options.step !== 0) {
          return `Number must be a multiple of ${options.step}`;
        }
        return true;
      },
    });

    return parseFloat(value);
  }

  /**
   * Date input with format validation
   */
  async date(options: PromptDateOptions): Promise<Date> {
    const format = options.format || 'YYYY-MM-DD';
    const formatHint = colors.gray(` (${format})`);

    process.stdout.write(`${this.prefix} ${options.message}${formatHint} `);

    const value = await readLine({
      validate: (v) => {
        const date = new Date(v);
        if (isNaN(date.getTime())) return 'Please enter a valid date';
        if (options.min && date < options.min) {
          return `Date must be after ${options.min.toISOString().split('T')[0]}`;
        }
        if (options.max && date > options.max) {
          return `Date must be before ${options.max.toISOString().split('T')[0]}`;
        }
        return true;
      },
    });

    return new Date(value);
  }

  /**
   * Editor input (opens $EDITOR)
   */
  async editor(options: PromptEditorOptions): Promise<string> {
    const { spawn } = await import('child_process');
    const { writeFileSync, readFileSync, unlinkSync } = await import('fs');
    const { tmpdir } = await import('os');
    const { join } = await import('path');

    const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
    const ext = options.extension || '.txt';
    const tmpFile = join(tmpdir(), `prompt-${Date.now()}${ext}`);

    // Write default content
    writeFileSync(tmpFile, options.default || '');

    process.stdout.write(`${this.prefix} ${options.message} ${colors.gray(`(opening ${editor}...)`)}\n`);

    return new Promise((resolve, reject) => {
      const child = spawn(editor, [tmpFile], {
        stdio: 'inherit',
      });

      child.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Editor exited with code ${code}`));
          return;
        }

        try {
          const content = readFileSync(tmpFile, 'utf8');
          unlinkSync(tmpFile);
          resolve(content);
        } catch (err) {
          reject(err);
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Multi-step wizard with conditional steps
   */
  async wizard<T>(options: PromptWizardOptions<T>): Promise<T> {
    const answers: Partial<T> = {};

    for (const step of options.steps) {
      // Check condition
      if (step.when && !step.when(answers as T)) {
        continue;
      }

      // Execute prompt
      const promptOptions = step.prompt as any;
      let result: unknown;

      if (promptOptions.type === 'input') {
        result = await this.input(promptOptions);
      } else if (promptOptions.type === 'password') {
        result = await this.password(promptOptions);
      } else if (promptOptions.type === 'confirm') {
        result = await this.confirm(promptOptions);
      } else if (promptOptions.type === 'select') {
        result = await this.select(promptOptions);
      } else if (promptOptions.type === 'multiselect') {
        result = await this.multiselect(promptOptions);
      } else if (promptOptions.type === 'number') {
        result = await this.number(promptOptions);
      } else if (promptOptions.type === 'date') {
        result = await this.date(promptOptions);
      } else if (promptOptions.type === 'editor') {
        result = await this.editor(promptOptions);
      } else if (promptOptions.type === 'autocomplete') {
        result = await this.autocomplete(promptOptions);
      } else {
        // Default to input
        result = await this.input(promptOptions);
      }

      (answers as any)[step.name] = result;
    }

    return answers as T;
  }
}

/**
 * Prompt plugin
 * Provides interactive prompts
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { promptPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(promptPlugin());
 *
 * app.command('init').action(async ({ prompt }) => {
 *   const name = await prompt.input({ message: 'Project name:' });
 *   const useTs = await prompt.confirm({ message: 'Use TypeScript?' });
 *   const framework = await prompt.select({
 *     message: 'Framework:',
 *     choices: ['React', 'Vue', 'Svelte']
 *   });
 * });
 * ```
 */
export function promptPlugin(options: PromptPluginOptions = {}): CLIPlugin {
  return {
    name: 'prompt',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      kernel.on('command:before', async (data: any) => {
        const promptUtils = new PromptImpl(options);
        data.context.prompt = promptUtils;
      });
    },
  };
}
