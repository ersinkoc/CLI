# Contributing to @oxog/cli

Thank you for your interest in contributing to @oxog/cli! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- Clear description of the enhancement
- Use cases for the enhancement
- Potential implementation approach (if known)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linter (`npm run lint` and `npm run format`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/cli.git
cd cli

# Install dependencies
npm install

# Run tests
npm test

# Watch mode for development
npm run dev

# Run linting
npm run lint
npm run format
```

### Coding Standards

- Follow the existing code style
- Use TypeScript for all new code
- Add tests for new features
- Update documentation as needed
- Keep 100% test coverage

### Commit Messages

Follow semantic commit messages:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```
feat: add support for custom validators in options

Add a new `validate` function option to OptionDef that allows
custom validation logic for option values.

Closes #123
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
