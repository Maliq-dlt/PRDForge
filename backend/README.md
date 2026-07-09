# PRDForge Backend API

This is the backend API for the AI PRD Builder (PRDForge) application, built with Laravel 11, SQLite, and Laravel Sanctum.

---

## 🛠️ Architecture & Design
- **API Versioning**: Serves under `/api/v1/` prefix.
- **Authentication**: Fully secured using Sanctum Token Auth.
- **Multi-Tenancy**: Data isolation on project and AI provider entities scoped to authenticated users.
- **Background Queue**: Asynchronous verification jobs for credential validation.
- **Security Casts**: API keys are securely cast as `encrypted` and hidden from model serializations.
- **SSRF Protection**: Custom verification checks are validated to block private range connections for non-local providers.

---

## 🚀 Getting Started

### Requirements
- PHP 8.3+
- SQLite

### Setup Instructions
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   ```
3. Install Composer dependencies:
   ```bash
   composer install
   ```
4. Generate encryption key:
   ```bash
   php artisan key:generate
   ```
5. Run migrations and seed default values:
   ```bash
   php artisan migrate:fresh --seed
   ```
6. Start the local server:
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```

---

## 🧪 Testing and Quality Control

### Running PHPUnit Tests
```bash
php artisan test
```

### Running Code Formatting (Pint)
To verify or automatically fix coding style issues, run:
```bash
vendor/bin/pint
```
