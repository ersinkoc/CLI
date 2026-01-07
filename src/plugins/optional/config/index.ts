import type { CLIPlugin, CLIKernel } from '../../../types.js';

/**
 * Config plugin options
 */
export interface ConfigPluginOptions {
  /** Application name for config lookup */
  name?: string;
  /** Search paths for config files */
  searchPaths?: string[];
  /** Default config values */
  defaults?: Record<string, unknown>;
  /** Environment variable prefix */
  envPrefix?: string;
  /** Config file names to search */
  fileNames?: string[];
}

/**
 * Parsed config result
 */
export interface ConfigResult {
  /** Loaded configuration */
  config: Record<string, unknown>;
  /** Path to loaded config file (if any) */
  filePath?: string;
  /** Source of configuration */
  source: 'file' | 'env' | 'defaults' | 'combined';
}

/**
 * Simple JSON parser
 */
function parseJSON(content: string): Record<string, unknown> {
  return JSON.parse(content);
}

/**
 * Simple .env parser
 */
function parseEnv(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    let key = trimmed.slice(0, eqIndex).trim();
    let value: string = trimmed.slice(eqIndex + 1).trim();

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Handle escape sequences
    value = value
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');

    result[key] = value;
  }

  return result;
}

/**
 * Simple YAML parser (basic key: value format)
 */
function parseYAML(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');
  const stack: { indent: number; obj: Record<string, unknown> }[] = [{ indent: -1, obj: result }];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Get indentation
    const indent = line.search(/\S/);

    // Find parent based on indentation
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].obj;

    // Parse key: value
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();

    if (!value) {
      // Nested object
      const newObj: Record<string, unknown> = {};
      parent[key] = newObj;
      stack.push({ indent, obj: newObj });
    } else {
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Parse value types
      if (value === 'true') {
        parent[key] = true;
      } else if (value === 'false') {
        parent[key] = false;
      } else if (value === 'null' || value === '~') {
        parent[key] = null;
      } else if (/^-?\d+$/.test(value)) {
        parent[key] = parseInt(value, 10);
      } else if (/^-?\d+\.\d+$/.test(value)) {
        parent[key] = parseFloat(value);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Simple array
        const arrContent = value.slice(1, -1);
        parent[key] = arrContent.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      } else {
        parent[key] = value;
      }
    }
  }

  return result;
}

/**
 * Simple TOML parser (basic key = value format)
 */
function parseTOML(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentSection = result;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Section header
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const section = trimmed.slice(1, -1);
      const parts = section.split('.');
      let obj = result;

      for (const part of parts) {
        if (!(part in obj)) {
          obj[part] = {};
        }
        obj = obj[part] as Record<string, unknown>;
      }

      currentSection = obj;
      continue;
    }

    // Key = value
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // Parse value
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      currentSection[key] = value.slice(1, -1);
    } else if (value === 'true') {
      currentSection[key] = true;
    } else if (value === 'false') {
      currentSection[key] = false;
    } else if (/^-?\d+$/.test(value)) {
      currentSection[key] = parseInt(value, 10);
    } else if (/^-?\d+\.\d+$/.test(value)) {
      currentSection[key] = parseFloat(value);
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Simple array
      const arrContent = value.slice(1, -1);
      currentSection[key] = arrContent.split(',').map((v) => {
        const trimmedV = v.trim();
        if ((trimmedV.startsWith('"') && trimmedV.endsWith('"')) ||
            (trimmedV.startsWith("'") && trimmedV.endsWith("'"))) {
          return trimmedV.slice(1, -1);
        }
        if (trimmedV === 'true') return true;
        if (trimmedV === 'false') return false;
        if (/^-?\d+$/.test(trimmedV)) return parseInt(trimmedV, 10);
        if (/^-?\d+\.\d+$/.test(trimmedV)) return parseFloat(trimmedV);
        return trimmedV;
      });
    } else {
      currentSection[key] = value;
    }
  }

  return result;
}

/**
 * Deep merge objects
 */
function deepMerge(
  target: Record<string, unknown>,
  ...sources: Array<Record<string, unknown>>
): Record<string, unknown> {
  for (const source of sources) {
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        target[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      } else {
        target[key] = sourceValue;
      }
    }
  }

  return target;
}

/**
 * Config loader class
 */
export class ConfigLoader {
  private options: Required<ConfigPluginOptions>;

  constructor(options: ConfigPluginOptions = {}) {
    this.options = {
      name: options.name || 'app',
      searchPaths: options.searchPaths || [process.cwd()],
      defaults: options.defaults || {},
      envPrefix: options.envPrefix || '',
      fileNames: options.fileNames || [],
    };

    // Generate default file names if not provided
    if (this.options.fileNames.length === 0) {
      const name = this.options.name;
      this.options.fileNames = [
        `${name}.config.json`,
        `${name}.config.js`,
        `.${name}rc`,
        `.${name}rc.json`,
        `.${name}rc.yaml`,
        `.${name}rc.yml`,
        `.${name}rc.toml`,
        '.env',
      ];
    }
  }

  /**
   * Load configuration from files and environment
   */
  async load(): Promise<ConfigResult> {
    const fs = await import('fs');
    const path = await import('path');

    let fileConfig: Record<string, unknown> = {};
    let loadedFilePath: string | undefined;

    // Search for config files
    for (const searchPath of this.options.searchPaths) {
      for (const fileName of this.options.fileNames) {
        const filePath = path.join(searchPath, fileName);

        try {
          if (!fs.existsSync(filePath)) continue;

          const content = fs.readFileSync(filePath, 'utf8');
          const ext = path.extname(fileName).toLowerCase();

          if (ext === '.json' || fileName.endsWith('rc')) {
            try {
              fileConfig = parseJSON(content);
            } catch {
              // Try as .env format for .rc files
              if (fileName.endsWith('rc')) {
                fileConfig = parseEnv(content);
              }
            }
          } else if (ext === '.yaml' || ext === '.yml') {
            fileConfig = parseYAML(content);
          } else if (ext === '.toml') {
            fileConfig = parseTOML(content);
          } else if (ext === '.js') {
            // Dynamic import for JS config
            const module = await import(filePath);
            fileConfig = module.default || module;
          } else if (fileName === '.env') {
            fileConfig = parseEnv(content);
          }

          loadedFilePath = filePath;
          break;
        } catch {
          // Continue to next file
        }
      }

      if (loadedFilePath) break;
    }

    // Check package.json
    if (!loadedFilePath) {
      for (const searchPath of this.options.searchPaths) {
        const pkgPath = path.join(searchPath, 'package.json');
        try {
          if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg[this.options.name]) {
              fileConfig = pkg[this.options.name];
              loadedFilePath = pkgPath;
              break;
            }
          }
        } catch {
          // Continue
        }
      }
    }

    // Load from environment variables
    const envConfig: Record<string, unknown> = {};
    const prefix = this.options.envPrefix
      ? this.options.envPrefix.toUpperCase() + '_'
      : '';

    for (const [key, value] of Object.entries(process.env)) {
      if (prefix && !key.startsWith(prefix)) continue;

      const configKey = prefix
        ? key.slice(prefix.length).toLowerCase().replace(/_/g, '.')
        : key.toLowerCase().replace(/_/g, '.');

      // Set nested key
      const parts = configKey.split('.');
      let obj = envConfig;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in obj)) {
          obj[parts[i]] = {};
        }
        obj = obj[parts[i]] as Record<string, unknown>;
      }
      obj[parts[parts.length - 1]] = value;
    }

    // Merge: defaults < file < env
    const config = deepMerge(
      {},
      this.options.defaults,
      fileConfig,
      envConfig
    );

    return {
      config,
      filePath: loadedFilePath,
      source: loadedFilePath ? 'combined' : (Object.keys(envConfig).length > 0 ? 'env' : 'defaults'),
    };
  }

  /**
   * Get a specific config value by path
   */
  get<T = unknown>(config: Record<string, unknown>, path: string, defaultValue?: T): T {
    const parts = path.split('.');
    let value: unknown = config;

    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return defaultValue as T;
      }
      value = (value as Record<string, unknown>)[part];
    }

    return (value ?? defaultValue) as T;
  }
}

/**
 * Config utilities interface
 */
export interface ConfigUtils {
  /** Loaded configuration */
  config: Record<string, unknown>;
  /** Path to config file */
  filePath?: string;
  /** Get a config value by path */
  get<T = unknown>(path: string, defaultValue?: T): T;
  /** Reload configuration */
  reload(): Promise<void>;
}

/**
 * Config plugin
 * Provides configuration file support
 *
 * @example
 * ```typescript
 * import { cli } from '@oxog/cli';
 * import { configPlugin } from '@oxog/cli/plugins';
 *
 * const app = cli('myapp')
 *   .use(configPlugin({
 *     name: 'myapp',
 *     defaults: { port: 3000 },
 *     envPrefix: 'MYAPP'
 *   }));
 *
 * app.command('start').action(async ({ config }) => {
 *   const port = config.get('port', 3000);
 *   console.log(`Starting on port ${port}`);
 * });
 * ```
 */
export function configPlugin(options: ConfigPluginOptions = {}): CLIPlugin {
  const loader = new ConfigLoader(options);
  let loadedConfig: ConfigResult | undefined;

  return {
    name: 'config',
    version: '1.0.0',

    async onInit() {
      loadedConfig = await loader.load();
    },

    install(kernel: CLIKernel) {
      kernel.on('command:before', async (data: any) => {
        if (!loadedConfig) {
          loadedConfig = await loader.load();
        }

        const configUtils: ConfigUtils = {
          config: loadedConfig.config,
          filePath: loadedConfig.filePath,
          get: <T>(path: string, defaultValue?: T) =>
            loader.get(loadedConfig!.config, path, defaultValue),
          reload: async () => {
            loadedConfig = await loader.load();
            configUtils.config = loadedConfig.config;
            configUtils.filePath = loadedConfig.filePath;
          },
        };

        data.context.config = configUtils;
      });
    },
  };
}
