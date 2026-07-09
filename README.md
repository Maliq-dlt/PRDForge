# AI PRD Builder

Open source workspace untuk membuat PRD dengan bantuan AI. Flow aplikasi dimulai dari chat ide, pilihan stack AI/manual/hybrid, pertanyaan adaptif, Mermaid scratchboard, lalu PRD Markdown dengan revisi patch tanpa mengulang dari awal.

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind v4, shadcn/ui-style components, Framer Motion, Lenis, Mermaid.
- Backend: Laravel API, SQLite local database, API Resources, Form Requests, service health check.
- AI provider settings: OpenAI/GPT, Gemini/Google, Local LLM, dan custom endpoint OpenAI-compatible.

## Struktur

- `frontend/`: aplikasi web utama.
- `backend/`: Laravel API, database, migrations, seeders, provider AI, project, history, settings.
- `PRD-AI-PRD-Builder.md`: dokumen PRD awal.

## Menjalankan Lokal

Terminal 1:

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2:

```bash
cd frontend
npm run dev
```

URL lokal:

```text
Frontend: http://127.0.0.1:5173/
Backend:  http://127.0.0.1:8000/api/v1/health
Settings: http://127.0.0.1:8000/api/v1/settings/bootstrap
```

## Setup Database

```bash
cd backend
php artisan migrate:fresh --seed
```

Seeder membuat provider AI awal, project contoh, conversation history, dan settings storage/notifications/apps.

## Verifikasi

```bash
cd frontend
npm run build
npm run lint
npm run smoke:visual

cd backend
php artisan test
```

Smoke visual mengecek settings provider AI, health tile frontend/API/database, flow PRD, Mermaid render, dan tombol export di desktop serta mobile.