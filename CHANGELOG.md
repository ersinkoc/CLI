# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
