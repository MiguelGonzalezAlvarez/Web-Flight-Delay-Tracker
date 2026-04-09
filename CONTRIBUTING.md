# Contributing to Flight Tracker

Thank you for your interest in contributing to Flight Tracker!

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:

1. Check the [issue tracker](https://github.com/MiguelGonzalezAlvarez/Web-Flight-Delay-Tracker/issues) to see if the issue has already been reported
2. Ensure the bug is reproducible
3. Include as much detail as possible:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node version)

### Suggesting Features

We welcome feature suggestions! Please:

1. Check the issue tracker for existing suggestions
2. Describe the feature and its use case
3. Explain why it would benefit the project

### Pull Requests

#### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Web-Flight-Delay-Tracker.git
   cd flight-tracker
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Workflow

1. Make your changes
2. Write/update tests as needed
3. Ensure all tests pass:
   ```bash
   npm test
   ```
4. Run the build:
   ```bash
   npm run build
   ```
5. Commit your changes using conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request

#### Conventional Commits

We use conventional commits for clear and consistent commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `perf:` Performance improvements
- `chore:` Maintenance tasks

Example:
```
feat: add airport search functionality

Add search functionality to AirportSelector component with
filtering by ICAO, IATA, name, and city.
```

#### Coding Standards

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Write unit tests for new functionality

#### Testing Requirements

- All new features should include tests
- All tests must pass before merging
- Aim for meaningful test coverage
- Use descriptive test names

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/     # React components
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── lib/           # Utilities and libraries
└── tests/         # Test files
```

## Commit History

After completing a phase or feature:

1. Ensure all tests pass
2. Commit with descriptive message
3. Push to remote
4. Create pull request if applicable

## Questions?

Feel free to open an issue for any questions or concerns.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
