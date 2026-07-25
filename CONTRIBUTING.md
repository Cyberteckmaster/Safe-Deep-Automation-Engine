# Contributing to Safe-Deep Automation Engine

Thank you for your interest in contributing to the Safe-Deep Automation Engine! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all backgrounds and experience levels.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)

### Suggesting Features

1. Check existing issues to avoid duplicates
2. Create a feature request issue with:
   - Problem statement
   - Proposed solution
   - Use cases
   - Potential implementation ideas

### Pull Requests

1. Fork the repository
2. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Test thoroughly
5. Commit with clear messages:
   ```bash
   git commit -m "feat: add new feature description"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Safe-Deep-Automation-Engine.git
   cd Safe-Deep-Automation-Engine
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your API key to `.env`

5. Run tests:
   ```bash
   npm test
   ```

## Coding Standards

- Use ES6+ syntax
- Follow existing code style
- Add comments for complex logic
- Write meaningful commit messages
- Include tests for new features

### Commit Message Format

```
type: subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Testing

Before submitting a PR:

1. Run existing tests:
   ```bash
   npm test
   ```

2. Test your changes manually:
   ```bash
   npm run generate -t "Test Topic"
   ```

3. Ensure no console errors or warnings

## Documentation

- Update README.md if adding new features
- Add JSDoc comments to functions
- Include usage examples

## Questions?

Open an issue or contact the maintainers. We're happy to help!

---

Thank you for contributing to Safe-Deep Automation Engine! 🚀
