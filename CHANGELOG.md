# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-09

### Added
- **Authentication**: Laravel Sanctum API Token authentication, complete with registering, logging in, and logging out on the backend, and guarded view pages on the frontend.
- **Routing**: React Router implementation in the frontend for robust navigation and deep linking support.
- **State Management**: Added Zustand store to manage user auth state and global workspace actions.
- **Soft Deletes**: Enabled database soft deletion on all major tables to prevent permanent accidental data loss.
- **Pagination**: Implemented pagination on Projects and AI Providers listing endpoints.
- **GitHub Actions**: Configured automated CI/CD pipelines to build, lint, and test both stacks.
- **Docker Support**: Configured containerized environments for both Laravel and React stacks.
- **Async Processing**: Implemented Laravel Queue Jobs (`VerifyAiProviderQuota`) to verify AI provider status in the background.

### Fixed
- **XSS Vulnerability**: Sanitized Mermaid diagram SVG rendering via DOMPurify and tightened security level to strict.
- **Unsecured Keys**: Rotated APP_KEY and removed `.env` tracking from git repository history.
- **CORS Config**: Resolved CORS blocks by configuring allowed origins.
- **DDoS/Brute Force**: Enforced rate limiting group throttle on API routes.
- **White Screen Crashes**: Introduced React Error Boundaries around the main layout shell.
