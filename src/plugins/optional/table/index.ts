import type { CLIPlugin, CLIKernel } from '../../../types.js';
import { colors } from '../../../utils/ansi.js';
import { getTerminalWidth } from '../../../utils/terminal.js';

/**
 * Table border styles
 */
export type BorderStyle = 'none' | 'single' | 'double' | 'rounded' | 'heavy' | 'ascii';

/**
 * Table alignment
 */
export type Alignment = 'left' | 'center' | 'right';

/**
 * Column definition
 */
export interface ColumnDef {
  /** Column key in data */
  key: string;
  /** Column header */
  header?: string;
  /** Column width (characters) */
  width?: number;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Text alignment */
  align?: Alignment;
  /** Format function */
  format?: (value: unknown, row: Record<string, unknown>) => string;
  /** Header alignment */
  headerAlign?: Alignment;
  /** Wrap text */
  wrap?: boolean;
}

/**
 * Table options
 */
export interface TableOptions {
  /** Column definitions */
  columns?: Array<string | ColumnDef>;
  /** Show header row */
  header?: boolean;
  /** Border style */
  border?: BorderStyle;
  /** Padding inside cells */
  padding?: number;
  /** Maximum table width */
  maxWidth?: number;
  /** Truncate long text */
  truncate?: boolean;
  /** Row separator */
  rowSeparator?: boolean;
  /** Header style function */
  headerStyle?: (text: string) => string;
  /** Cell style function */
  cellStyle?: (value: unknown, column: string, row: Record<string, unknown>) => string;
}

/**
 * Border character sets
 */
const BORDERS: Record<BorderStyle, {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  cross: string;
  topT: string;
  bottomT: string;
  leftT: string;
  rightT: string;
}> = {
  none: {
    topLeft: '', topRight: '', bottomLeft: '', bottomRight: '',
    horizontal: '', vertical: '', cross: '',
    topT: '', bottomT: '', leftT: '', rightT: '',
  },
  single: {
    topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘',
    horizontal: '─', vertical: '│', cross: '┼',
    topT: '┬', bottomT: '┴', leftT: '├', rightT: '┤',
  },
  double: {
    topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
    horizontal: '═', vertical: '║', cross: '╬',
    topT: '╦', bottomT: '╩', leftT: '╠', rightT: '╣',
  },
  rounded: {
    topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
    horizontal: '─', vertical: '│', cross: '┼',
    topT: '┬', bottomT: '┴', leftT: '├', rightT: '┤',
  },
  heavy: {
    topLeft: '┏', topRight: '┓', bottomLeft: '┗', bottomRight: '┛',
    horizontal: '━', vertical: '┃', cross: '╋',
    topT: '┳', bottomT: '┻', leftT: '┣', rightT: '┫',
  },
  ascii: {
    topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+',
    horizontal: '-', vertical: '|', cross: '+',
    topT: '+', bottomT: '+', leftT: '+', rightT: '+',
  },
};

/**
 * Get visible string length (excluding ANSI codes)
 */
function visibleLength(str: string): number {
  return str.replace(/\x1b\[[0-9;]*m/g, '').length;
}

/**
 * Pad string to width
 */
function pad(str: string, width: number, align: Alignment = 'left'): string {
  const visible = visibleLength(str);
  const diff = width - visible;

  if (diff <= 0) return str;

  switch (align) {
    case 'left':
      return str + ' '.repeat(diff);
    case 'right':
      return ' '.repeat(diff) + str;
    case 'center':
      const left = Math.floor(diff / 2);
      const right = diff - left;
      return ' '.repeat(left) + str + ' '.repeat(right);
  }
}

/**
 * Truncate string to width
 */
function truncate(str: string, width: number): string {
  const visible = visibleLength(str);
  if (visible <= width) return str;

  // Simple truncation - doesn't handle ANSI codes perfectly
  return str.slice(0, width - 1) + '…';
}

/**
 * Wrap text to width
 */
function wrapText(str: string, width: number): string[] {
  if (visibleLength(str) <= width) return [str];

  const words = str.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (visibleLength(currentLine) + 1 + visibleLength(word) <= width) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Table class
 */
export class Table {
  private data: Array<Record<string, unknown>> = [];
  private options: Required<TableOptions>;
  private columns: ColumnDef[] = [];

  constructor(options: TableOptions = {}) {
    this.options = {
      columns: options.columns || [],
      header: options.header ?? true,
      border: options.border ?? 'single',
      padding: options.padding ?? 1,
      maxWidth: options.maxWidth ?? getTerminalWidth(),
      truncate: options.truncate ?? true,
      rowSeparator: options.rowSeparator ?? false,
      headerStyle: options.headerStyle ?? colors.bold,
      cellStyle: options.cellStyle ?? ((v) => String(v)),
    };
  }

  /**
   * Add rows to the table
   */
  addRows(rows: Array<Record<string, unknown>>): this {
    this.data.push(...rows);
    return this;
  }

  /**
   * Add a single row
   */
  addRow(row: Record<string, unknown>): this {
    this.data.push(row);
    return this;
  }

  /**
   * Clear all rows
   */
  clear(): this {
    this.data = [];
    return this;
  }

  /**
   * Render the table to string
   */
  render(): string {
    if (this.data.length === 0) {
      return '';
    }

    // Determine columns
    this.columns = this.resolveColumns();

    // Calculate column widths
    this.calculateWidths();

    // Build table
    const lines: string[] = [];
    const border = BORDERS[this.options.border];
    const hasBorder = this.options.border !== 'none';
    const padding = ' '.repeat(this.options.padding);

    // Top border
    if (hasBorder) {
      lines.push(this.buildBorderLine(border.topLeft, border.horizontal, border.topT, border.topRight));
    }

    // Header
    if (this.options.header) {
      const headerCells = this.columns.map((col) => {
        const header = col.header || col.key;
        const styled = this.options.headerStyle(header);
        const aligned = pad(styled, col.width!, col.headerAlign || col.align || 'left');
        return padding + aligned + padding;
      });

      if (hasBorder) {
        lines.push(border.vertical + headerCells.join(border.vertical) + border.vertical);
        lines.push(this.buildBorderLine(border.leftT, border.horizontal, border.cross, border.rightT));
      } else {
        lines.push(headerCells.join(' '));
      }
    }

    // Data rows
    for (let i = 0; i < this.data.length; i++) {
      const row = this.data[i];
      const cells = this.columns.map((col) => {
        let value = row[col.key];

        // Format value
        if (col.format) {
          value = col.format(value, row);
        } else {
          value = String(value ?? '');
        }

        // Apply cell style
        let styled = this.options.cellStyle(value, col.key, row);

        // Truncate or wrap
        if (this.options.truncate && !col.wrap) {
          styled = truncate(styled, col.width!);
        }

        const aligned = pad(styled, col.width!, col.align || 'left');
        return padding + aligned + padding;
      });

      if (hasBorder) {
        lines.push(border.vertical + cells.join(border.vertical) + border.vertical);
      } else {
        lines.push(cells.join(' '));
      }

      // Row separator
      if (this.options.rowSeparator && i < this.data.length - 1 && hasBorder) {
        lines.push(this.buildBorderLine(border.leftT, border.horizontal, border.cross, border.rightT));
      }
    }

    // Bottom border
    if (hasBorder) {
      lines.push(this.buildBorderLine(border.bottomLeft, border.horizontal, border.bottomT, border.bottomRight));
    }

    return lines.join('\n');
  }

  /**
   * Print the table to stdout
   */
  print(): void {
    console.log(this.render());
  }

  private resolveColumns(): ColumnDef[] {
    if (this.options.columns.length > 0) {
      return this.options.columns.map((col) => {
        if (typeof col === 'string') {
          return { key: col, header: col };
        }
        return { ...col, header: col.header || col.key };
      });
    }

    // Auto-detect columns from data
    const keys = new Set<string>();
    for (const row of this.data) {
      for (const key of Object.keys(row)) {
        keys.add(key);
      }
    }

    return Array.from(keys).map((key) => ({ key, header: key }));
  }

  private calculateWidths(): void {
    const padding = this.options.padding * 2;
    const borderWidth = this.options.border !== 'none' ? this.columns.length + 1 : 0;
    const availableWidth = this.options.maxWidth - borderWidth;

    for (const col of this.columns) {
      // Start with header width
      let width = visibleLength(col.header || col.key);

      // Check data widths
      for (const row of this.data) {
        let value = row[col.key];
        if (col.format) {
          value = col.format(value, row);
        }
        const len = visibleLength(String(value ?? ''));
        width = Math.max(width, len);
      }

      // Apply constraints
      if (col.minWidth) width = Math.max(width, col.minWidth);
      if (col.maxWidth) width = Math.min(width, col.maxWidth);
      if (col.width) width = col.width;

      col.width = width;
    }

    // Distribute remaining width if needed
    const totalWidth = this.columns.reduce((sum, col) => sum + col.width! + padding, 0);
    if (totalWidth > availableWidth) {
      const scale = availableWidth / totalWidth;
      for (const col of this.columns) {
        col.width = Math.max(1, Math.floor(col.width! * scale));
      }
    }
  }

  private buildBorderLine(left: string, horizontal: string, cross: string, right: string): string {
    const padding = this.options.padding * 2;
    const segments = this.columns.map((col) => horizontal.repeat(col.width! + padding));
    return left + segments.join(cross) + right;
  }
}

/**
 * Table utilities interface
 */
export interface TableUtils {
  /** Create a new table */
  create(options?: TableOptions): Table;
  /** Render data as table string */
  render(data: Array<Record<string, unknown>>, options?: TableOptions): string;
  /** Print data as table */
  print(data: Array<Record<string, unknown>>, options?: TableOptions): void;
}

/**
 * Table plugin
 * Provides table formatting utilities
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { tablePlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(tablePlugin());
 *
 * app.command('list').action(({ table }) => {
 *   const data = [
 *     { name: 'Alice', age: 30, city: 'NYC' },
 *     { name: 'Bob', age: 25, city: 'LA' },
 *   ];
 *
 *   table.print(data, {
 *     columns: ['name', 'age', 'city'],
 *     border: 'rounded'
 *   });
 * });
 * ```
 */
export function tablePlugin(): CLIPlugin {
  return {
    name: 'table',
    version: '1.0.0',

    install(kernel: CLIKernel) {
      kernel.on('command:before', async (data: any) => {
        const tableUtils: TableUtils = {
          create: (options?: TableOptions) => new Table(options),
          render: (data, options) => {
            const t = new Table(options);
            t.addRows(data);
            return t.render();
          },
          print: (data, options) => {
            const t = new Table(options);
            t.addRows(data);
            t.print();
          },
        };

        data.context.table = tableUtils;
      });
    },
  };
}

// Export Table class for direct use
export { Table as TableFormatter };
