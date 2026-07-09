# Contributing to AI PRD Builder

First off, thank you for considering contributing to AI PRD Builder! It's people like you who make open source projects so awesome.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct (detailed in `CODE_OF_CONDUCT.md`).

## How Can I Contribute?

### Reporting Bugs
- Always check the issue tracker first to see if your bug has already been reported.
- If it hasn't, open a new issue. Include a clear title, description, steps to reproduce, and screenshots if applicable.

### Suggesting Features
- Open a feature request issue.
- Clearly describe the feature, the problem it solves, and how it fits into the scope of the project.

### Submitting Pull Requests
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes. Ensure frontend linters (`npm run lint`), TypeScript checks (`npm run build`), and tests (`npm run test`) pass. Ensure Laravel tests pass (`php artisan test`).
4. Push to your branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request against the `main` branch.

## Setup Guidelines

Refer to the main `README.md` for backend (Laravel) and frontend (React) setup steps. We also support Docker Compose for local development:
```bash
docker compose up --build
```
