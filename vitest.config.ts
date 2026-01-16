import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Fix @oxog/pigment export resolution (exports points to .mjs but file is .js)
      '@oxog/pigment': resolve(__dirname, 'node_modules/@oxog/pigment/dist/index.js'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Only cover files that are actually executed by tests
      all: false,
      exclude: [
        'node_modules/',
        'tests/',
        'website/',
        'examples/',
        'mcp-server/',
        '*.config.*',
        'dist/',
        // Exclude barrel files (re-exports only)
        'src/index.ts',
        'src/types.ts',
        'src/plugins/index.ts',
        'src/command/index.ts',
        'src/parser/index.ts',
        'src/utils/index.ts',
        'src/events/index.ts',
        'src/errors/index.ts',
        'src/plugins/core/index.ts',
        'src/plugins/optional/*/index.ts',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
