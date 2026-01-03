/**
 * Examples Integration Tests
 * Tests all example applications to ensure they work correctly
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const examplesDir = join(__dirname, '../../examples');

// Helper function to run an example file
async function runExample(examplePath: string, args: string[] = []): Promise<{
  code: number | null;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    // Use tsx to run TypeScript files directly
    const proc = spawn('npx', ['tsx', examplePath, ...args], {
      cwd: examplesDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' },
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', (error) => {
      stderr += error.message;
      resolve({ code: 1, stdout, stderr });
    });

    // Kill after timeout
    setTimeout(() => {
      proc.kill();
      resolve({ code: 1, stdout, stderr: 'Timeout' });
    }, 10000);
  });
}

describe('Examples Integration Tests', () => {
  describe('01-basic', () => {
    it('hello-world: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '01-basic/hello-world.ts'), []);
      expect(result.code).toBe(0);
      expect(result.stdout).toBeTruthy();
    });

    it('hello-world: should greet with default command', async () => {
      const result = await runExample(join(examplesDir, '01-basic/hello-world.ts'), ['default']);
      expect(result.stdout).toContain('Hello, World!');
    });

    it('hello-world: should greet with name', async () => {
      const result = await runExample(join(examplesDir, '01-basic/hello-world.ts'), [
        'greet',
        'World',
      ]);
      expect(result.stdout).toContain('Hello, World!');
    });

    it('hello-world: should greet loudly', async () => {
      const result = await runExample(join(examplesDir, '01-basic/hello-world.ts'), [
        'greet',
        'World',
        '--loud',
      ]);
      expect(result.stdout).toContain('HELLO, WORLD!');
    });

    it('with-options: should show help', async () => {
      const result = await runExample(join(examplesDir, '01-basic/with-options.ts'), ['--help']);
      expect(result.code).toBe(0);
    });

    it('with-options: should run server command', async () => {
      const result = await runExample(join(examplesDir, '01-basic/with-options.ts'), [
        'server',
        '--port',
        '8080',
      ]);
      expect(result.stdout).toContain('localhost:8080');
    });

    it('with-options: should run build command', async () => {
      const result = await runExample(join(examplesDir, '01-basic/with-options.ts'), ['build', '--watch']);
      expect(result.stdout).toContain('Watch mode');
    });

    it('with-options: should run install command', async () => {
      const result = await runExample(join(examplesDir, '01-basic/with-options.ts'), [
        'install',
        '--packages',
        'lodash,axios',
      ]);
      expect(result.stdout).toContain('Installing:');
    });

    it('subcommands: should show help', async () => {
      const result = await runExample(join(examplesDir, '01-basic/subcommands.ts'), ['--help']);
      expect(result.code).toBe(0);
    });

    it('subcommands: should run config get', async () => {
      const result = await runExample(join(examplesDir, '01-basic/subcommands.ts'), [
        'config',
        'get',
        'name',
      ]);
      expect(result.stdout).toContain('name');
    });

    it('subcommands: should run config set', async () => {
      const result = await runExample(join(examplesDir, '01-basic/subcommands.ts'), [
        'config',
        'set',
        'key',
        'value',
      ]);
      // Should complete without error
      expect(result.code).toBe(0);
    });

    it('subcommands: should run user list', async () => {
      const result = await runExample(join(examplesDir, '01-basic/subcommands.ts'), [
        'user',
        'list',
      ]);
      expect(result.stdout).toContain('Users:');
    });
  });

  describe('02-api-styles', () => {
    it('fluent-builder: should run build command', async () => {
      const result = await runExample(join(examplesDir, '02-api-styles/fluent-builder.ts'), [
        'build',
      ]);
      // Should complete without error
      expect(result.code).toBe(0);
    });

    it('fluent-builder: should run build with options', async () => {
      const result = await runExample(join(examplesDir, '02-api-styles/fluent-builder.ts'), [
        'build',
        '--minify',
      ]);
      expect(result.code).toBe(0);
    });

    it('fluent-builder: should run deploy command', async () => {
      const result = await runExample(join(examplesDir, '02-api-styles/fluent-builder.ts'), [
        'deploy',
      ]);
      expect(result.code).toBe(0);
    });
  });

  describe('03-prompts', () => {
    it('interactive-prompts: should run init command', async () => {
      const result = await runExample(join(examplesDir, '03-prompts/interactive-prompts.ts'), [
        'init',
      ]);
      expect(result.stdout).toContain('Welcome');
    });
  });

  describe('04-output', () => {
    it('spinners: should run basic spinner', async () => {
      const result = await runExample(join(examplesDir, '04-output/spinners.ts'), ['basic']);
      expect(result.code).toBe(0);
    });

    it('spinners: should run states command', async () => {
      const result = await runExample(join(examplesDir, '04-output/spinners.ts'), ['states']);
      expect(result.code).toBe(0);
    });

    it('spinners: should run workflow command', async () => {
      const result = await runExample(join(examplesDir, '04-output/spinners.ts'), ['workflow']);
      expect(result.code).toBe(0);
    }, 10000);
  });

  describe('05-validation', () => {
    it('validation: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '05-validation/validation.ts'), ['--help']);
      expect(result.code).toBe(0);
    });
  });

  describe('06-real-world', () => {
    it('create-app: should show help', async () => {
      const result = await runExample(join(examplesDir, '06-real-world/create-app.ts'), ['--help']);
      expect(result.code).toBe(0);
    });
  });

  describe('07-middleware', () => {
    it('middleware-chain: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '07-middleware/middleware-chain.ts'), [
        'build',
      ]);
      expect(result.code).toBe(0);
    });
  });

  describe('08-plugins', () => {
    it('custom-plugin: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '08-plugins/custom-plugin.ts'), ['--help']);
      expect(result.code).toBe(0);
    });
  });

  describe('09-error-handling', () => {
    it('error-handling: should show help', async () => {
      const result = await runExample(join(examplesDir, '09-error-handling/error-handling.ts'), [
        '--help',
      ]);
      expect(result.code).toBe(0);
    });
  });

  describe('10-config', () => {
    it('config-file: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '10-config/config-file.ts'), ['--help']);
      expect(result.code).toBe(0);
    });
  });

  describe('11-completions', () => {
    it('completions: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '11-completions/completions.ts'), ['--help']);
      expect(result.code).toBe(0);
    });
  });

  describe('12-logger', () => {
    it('structured-logging: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '12-logger/structured-logging.ts'), [
        '--help',
      ]);
      expect(result.code).toBe(0);
    });
  });

  describe('13-progress', () => {
    it('progress-bar: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '13-progress/progress-bar.ts'), ['--help']);
      expect(result.code).toBe(0);
    });
  });

  describe('14-table', () => {
    it('table-output: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '14-table/table-output.ts'), ['--help']);
      expect(result.code).toBe(0);
    });
  });

  describe('15-colors', () => {
    it('color-output: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '15-colors/color-output.ts'), ['--help']);
      expect(result.code).toBe(0);
    });
  });

  describe('16-advanced-options', () => {
    it('advanced-options: should run without errors', async () => {
      const result = await runExample(join(examplesDir, '16-advanced-options/advanced-options.ts'), [
        '--help',
      ]);
      expect(result.code).toBe(0);
    });
  });

  describe('All examples should have proper exit codes', () => {
    it('hello-world should exit with 0 on help', async () => {
      const result = await runExample(join(examplesDir, '01-basic/hello-world.ts'), ['--help']);
      expect(result.code).toBe(0);
    });

    it('with-options should exit with 0 on help', async () => {
      const result = await runExample(join(examplesDir, '01-basic/with-options.ts'), ['--help']);
      expect(result.code).toBe(0);
    });

    it('subcommands should exit with 0 on help', async () => {
      const result = await runExample(join(examplesDir, '01-basic/subcommands.ts'), ['--help']);
      expect(result.code).toBe(0);
    });
  });
});
