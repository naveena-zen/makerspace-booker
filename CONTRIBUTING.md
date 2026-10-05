# Contributing to Maker Space Booker

Thank you for contributing to Maker Space Booker! This repository follows GitFlow branching and Scrum development practices.

## Branching Strategy
- `main`: Production-ready releases. Deployed to production and GitHub Pages.
- `develop`: Integration branch for active sprint features.
- `feature/*`: Short-lived feature branches branched from `develop` and merged via Pull Request.
- `test/*`: Diagnostic or validation branches.

## Commit Conventions
We enforce [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New user-facing feature or API endpoint
- `fix:` Bug fix
- `ci:` Continuous integration / GitHub Actions updates
- `test:` Unit and integration tests
- `docs:` Documentation improvements

## Quality Standards
Before opening a Pull Request:
1. Ensure all services pass linting: `npm run lint`
2. Ensure all test suites pass: `npm test`
3. Fill out the PR template with clear description and checklist.
