# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-08-16

### Removed
- **Zero runtime dependencies**: Removed the `@oxog/emitter`, `@oxog/pigment`,
  `@oxog/plugin`, and `@oxog/types` peer dependencies
  - `dependencies` is now empty and `peerDependencies` no longer exist
  - Consumers no longer need to install ecosystem packages
  - **BREAKING**: Code importing directly from `@oxog/emitter`, `@oxog/pigment`,
    `@oxog/plugin`, or `@oxog/types` must migrate to the built-in equivalents
    (see Changed below)

### Added
- **Object Config API**: Define CLIs declaratively with `cli({ commands: {...} })`
  - Available from the root entry and the new `@oxog/cli/config` subpath
  - Nested commands, aliases, argument/option records, defaults, middleware
- **Decorator API**: `@CLI`, `@Command`, `@Argument`, `@Option` decorators plus
  the `CLIApplication` base class, via the new `@oxog/cli/decorator` subpath
  - Uses legacy (experimental) TypeScript decorators; no `reflect-metadata` needed
- Vendored typed event `Emitter` (wildcard/pattern subscriptions, `emitAsync`,
  configurable error strategies, max-listener warnings) exported from the root
- Vendored chainable color API (`createPigment()`, modifiers, 256-color,
  truecolor hex/rgb) exported from `@oxog/cli/plugins`
- 31 tests for the config/decorator APIs; 86 emitter and 77 pigment tests

### Changed
- The color plugin now uses the built-in pigment — always available, no dynamic
  import, identical Chalk-compatible surface
- README and docs repositioned around zero-dependency; ecosystem packages are
  no longer referenced
- Test count grew to 839 passing tests across 25 files; coverage 98.95% lines /
  96.52% branches against the >=95% thresholds

### Fixed
- Global (app-level) options now parse into command action contexts
- `hexToAnsi` handles `#abc` shorthand and invalid input without emitting NaN
- MCP server no longer generates duplicate `cli` imports; its decorator template
  matches the real package exports
- `tsup` declaration build: aliased the `CLI` type import in `src/api/decorator.ts`
  to avoid a value/type name collision with the exported `CLI` decorator function
- Repaired the ESLint config (registered `typescript-eslint` plugin and parser)
- Raised flaky spinner example test timeouts

## [2.0.1] - 2026-01-25

### Fixed
- **Router**: Fixed command routing to allow flags before subcommands
  - `cli --verbose build` now correctly routes to the `build` command
  - Previously, options before commands would cause routing failures

- **Array Options**: Fixed naive comma splitting that broke values like "San Francisco, CA"
  - Arrays now accumulate via multiple flag occurrences: `--tag a --tag b`
  - No automatic comma splitting (use custom `coerce` function if needed)
  - Preserves values with commas as single elements

- **process.exit Pollution**: Removed `process.exit()` calls from library code
  - Added `exitOnError` option (default: `true`) to control exit behavior
  - When `exitOnError: false`, errors propagate for library users to handle
  - Added `ExitRequest`, `HelpRequestedExit`, `VersionRequestedExit` error classes
  - Help and version plugins now throw instead of calling `process.exit`

- **Middleware Plugin Coupling**: Decoupled middleware plugin from core CLI class
  - Removed `as any` casts and magic property checks
  - Added typed `_addGlobalMiddleware` and `_middlewarePluginActive` properties
  - Cleaner interface for plugin integration

- **Kernel Dependency Resolution**: Fixed plugin dependency ordering
  - Plugins can now be registered in any order
  - Dependencies resolved at `initialize()` using topological sort
  - Circular dependency detection with clear error messages
  - Example: `kernel.register(pluginB)` before `kernel.register(pluginA)` now works

- **Context Type Safety**: Improved kernel context initialization
  - Changed from unsafe `{} as TContext` to `Object.create(null)`
  - Cleaner prototype chain for context objects

### Changed
- Middleware tests updated to use new `_addGlobalMiddleware` interface
- Parser tests updated for new array accumulation behavior
- Kernel tests updated for deferred dependency resolution
- Test count increased to 667 passing tests

### Migration Guide
If you were relying on comma-separated array values:
```typescript
// Before (2.0.0): --tags "a,b,c" -> ['a', 'b', 'c']
// After (2.0.1): --tags "a,b,c" -> ['a,b,c']

// New way to pass multiple values:
// --tags a --tags b --tags c -> ['a', 'b', 'c']

// Or use custom coerce for comma splitting:
.option('--tags <tags>', 'Tags', {
  type: 'array',
  coerce: (v) => String(v).split(',').map(s => s.trim())
})
```

## [2.0.0] - 2026-01-15

### Added
- Full @oxog ecosystem integration
- Re-exports from @oxog/types, @oxog/emitter, @oxog/plugin, @oxog/pigment

### Changed
- Migrated to peer dependencies for @oxog packages
- Updated plugin interfaces to use @oxog/plugin standards

## [1.1.0] - 2026-01-07

### Added
- 🎨 **promptPlugin** - Interactive command-line prompts with 10 prompt types
  - `input()` - Text input
  - `password()` - Masked password input
  - `confirm()` - Yes/no confirmation
  - `select()` - Single choice selection
  - `multiselect()` - Multiple choice selection
  - `autocomplete()` - Fuzzy search autocomplete
  - `number()` - Numeric input with validation
  - `date()` - Date input
  - `editor()` - Multi-line text editor
  - `wizard()` - Multi-step form wizard
- 📊 **progressPlugin** - Progress bars with ETA and rate display
  - Single progress bar support
  - Multi-progress bar manager
  - Customizable format strings (:bar, :percent, :eta, :rate)
- 📋 **tablePlugin** - Formatted table output
  - 6 border styles: none, single, double, rounded, heavy, ascii
  - Column alignment (left, center, right)
  - Custom formatters
  - Auto-width calculation
- ⚙️ **configPlugin** - Configuration file support
  - JSON, YAML, TOML, .env file parsing (zero dependencies)
  - Environment variable override with prefix
  - Nested path access (e.g., `config.get('database.host')`)
  - Hot reload support
- 🔧 **completionPlugin** - Shell completion generation
  - Bash, Zsh, Fish support
  - Auto-detection of current shell
  - Built-in `completion` command

### Changed
- Added `describe()` method alias to CommandBuilder (now both `description()` and `describe()` work)
- Improved type definitions with explicit utility interfaces
- Updated LLMS.md documentation with new plugins

### Fixed
- Fixed `ColorUtils` type not being exported from types.ts
- Fixed fuzzyFilter return type handling in autocomplete

## [1.0.0] - 2026-01-03

### Added
- 🎉 Initial release of @oxog/cli
- ✅ Zero runtime dependencies CLI framework
- 🔧 Fluent builder API for command definition
- 🎨 Full TypeScript support with strict mode
- 🔌 Micro-kernel plugin architecture
- 📦 Core plugins: help, version, validation, color, spinner, logger, middleware
- 🌈 ANSI color support for beautiful terminal output
- ⏳ Elegant loading spinners with multiple states
- 📝 Structured logging with multiple levels
- ✅ Argument and option validation
- 🔀 Command middleware support
- 🌳 Nested command hierarchy support
- 🧪 100% test coverage (606/606 tests passing)
- 📚 Comprehensive documentation and examples

### Features
- Type-safe command definitions
- Argument parsing with validation and coercion
- Option parsing with aliases, types, and defaults
- Global and command-specific options
- Command aliases for alternative names
- Middleware chain execution (global before command-specific)
- Plugin lifecycle hooks (install, onInit, onDestroy)
- Event bus for plugin communication
- Context sharing between plugins
- Error handling with custom error codes
- Help text generation
- Version display
- Levenshtein distance for command suggestions

### Examples
- 17 example applications demonstrating all features
- Basic CLI usage
- API styles (fluent builder vs object config)
- Interactive prompts
- Output formatting (spinners, colors, tables)
- Validation
- Real-world scenarios
- Plugin development
- Error handling
- Config file support
- Shell completions
- Progress bars
- Advanced options

## [0.1.0] - 2025-12-XX

### Added
- Initial project setup
- TypeScript configuration
- Build system with tsup
- Test framework with vitest
- ESLint and Prettier configuration

---

## How to Update This Changelog

1. Add new entries under the "Unreleased" section
2. Move entries to appropriate version sections when releasing
3. Follow the format: [Added], [Changed], [Deprecated], [Removed], [Fixed], [Security]
4. Use semantic commit messages as reference
