# AI PRD Builder Frontend

Frontend MVP untuk website open source yang membantu user membuat PRD dari ide mentah.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui component pattern
- Framer Motion
- Lenis
- Mermaid
- Lucide React

## Fitur MVP

- First screen berbentuk chat composer seperti ChatGPT.
- AI thinking summary muncul setelah ide dikirim.
- Flow bertahap: idea intake, stack decision, pertanyaan adaptif, Mermaid scratchboard, PRD.
- Mode stack: dipilih AI, manual, atau hybrid.
- Stack selector hanya menampilkan kategori inti: frontend, backend, database.
- Stack selector disembunyikan saat mode dipilih AI.
- Pertanyaan adaptif mendukung single choice, multi choice, optional, dan text answer.
- Scratchboard hanya membuat diagram yang berguna: flowchart, ERD, atau use case.
- Draft PRD Markdown.
- Patch revisi tanpa mengulang dari awal.
- Export Markdown.

## Menjalankan Project

```bash
npm install
npm run dev
```

Dev server default:

```text
http://127.0.0.1:5173/
```

## Validasi

```bash
npm run lint
npm run build
npm run smoke:visual
```

`smoke:visual` memakai Edge lokal melalui `playwright-core` dan menyimpan screenshot ke `screenshots/`.

## Catatan

AI di MVP ini masih deterministic/mock di `src/lib/prd-engine.ts`. Integrasi backend Laravel API dan provider AI sungguhan bisa disambungkan pada tahap berikutnya.