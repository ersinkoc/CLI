/**
 * Table Output Example
 *
 * Demonstrates formatted table output without external dependencies
 */

import { cli } from '../../src/index.js';

interface Column {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'right' | 'center';
}

class Table {
  private columns: Column[];
  private rows: Record<string, string | number>[];

  constructor(columns: Column[]) {
    this.columns = columns;
    this.rows = [];
  }

  addRow(row: Record<string, string | number>) {
    this.rows.push(row);
  }

  private pad(str: string, width: number, align: 'left' | 'right' | 'center' = 'left'): string {
    if (str.length >= width) return str.slice(0, width);

    const pad = width - str.length;
    if (align === 'left') return str + ' '.repeat(pad);
    if (align === 'right') return ' '.repeat(pad) + str;

    const left = Math.floor(pad / 2);
    const right = pad - left;
    return ' '.repeat(left) + str + ' '.repeat(right);
  }

  render() {
    // Calculate column widths
    const widths = this.columns.map(col =>
      Math.max(
        col.width || col.header.length,
        ...this.rows.map(row => String(row[col.key] || '').length)
      )
    );

    // Render header
    const header = this.columns
      .map((col, i) => this.pad(col.header, widths[i], col.align))
      .join(' | ');
    console.log('\x1b[1m' + header + '\x1b[0m');

    // Render separator
    const separator = this.columns
      .map((_, i) => '-'.repeat(widths[i]))
      .join('-+-');
    console.log(separator);

    // Render rows
    for (const row of this.rows) {
      const line = this.columns
        .map((col, i) => this.pad(String(row[col.key] || ''), widths[i], col.align))
        .join(' | ');
      console.log(line);
    }
  }
}

const app = cli('myapp')
  .version('1.0.0')
  .description('Table output example');

app.command('list')
  .description('List items in a table')
  .action(async () => {
    const table = new Table([
      { key: 'name', header: 'Name', width: 20 },
      { key: 'version', header: 'Version', width: 10, align: 'center' },
      { key: 'size', header: 'Size', width: 12, align: 'right' },
      { key: 'status', header: 'Status', width: 10 },
    ]);

    table.addRow({ name: 'express', version: '4.18.2', size: '234 KB', status: 'installed' });
    table.addRow({ name: 'react', version: '18.2.0', size: '1.2 MB', status: 'installed' });
    table.addRow({ name: 'typescript', version: '5.1.6', size: '45 MB', status: 'installed' });
    table.addRow({ name: 'vite', version: '4.3.9', size: '3.4 MB', status: 'outdated' });

    console.log('\nInstalled packages:\n');
    table.render();
  });

app.command('processes')
  .description('Show running processes')
  .action(async () => {
    const table = new Table([
      { key: 'pid', header: 'PID', width: 8, align: 'right' },
      { key: 'name', header: 'Name', width: 20 },
      { key: 'cpu', header: 'CPU%', width: 8, align: 'right' },
      { key: 'mem', header: 'Memory', width: 10, align: 'right' },
    ]);

    table.addRow({ pid: '1234', name: 'node', cpu: '12.5', mem: '256 MB' });
    table.addRow({ pid: '5678', name: 'chrome', cpu: '45.2', mem: '1.2 GB' });
    table.addRow({ pid: '9012', name: 'vscode', cpu: '23.8', mem: '890 MB' });

    console.log('\nRunning processes:\n');
    table.render();
  });

app.run();
