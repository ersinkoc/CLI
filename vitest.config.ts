import { defineConfig } from 'vitest/config';

export default defineConfig({
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
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
