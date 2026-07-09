export type StackMode = 'ai' | 'manual' | 'hybrid'
export type StackCategory = 'frontend' | 'backend' | 'database'
export type DiagramType = 'flowchart' | 'erd' | 'usecase'
export type QuestionMode = 'single' | 'multiple' | 'text'

export type ProductSummary = {
  title: string
  projectType: string
  complexity: 'simple' | 'medium' | 'complex'
  pitch: string
  thinking: string[]
  signals: string[]
  risks: string[]
  recommendedStack: StackDecision
}

export type StackDecision = Record<StackCategory, string>

export type StackCatalogItem = {
  category: StackCategory
  label: string
  hint: string
  options: string[]
}

export type AdaptiveQuestion = {
  id: string
  prompt: string
  reason: string
  mode: QuestionMode
  options: string[]
  optional?: boolean
}

export type AnswerValue = string | string[]
export type AnswerMap = Record<string, AnswerValue>
export type DiagramMap = Partial<Record<DiagramType, string>>

export const stackCatalog: StackCatalogItem[] = [
  {
    category: 'frontend',
    label: 'Frontend',
    hint: 'Tempat user memakai produk.',
    options: [
      'React 18 + TypeScript + Vite',
      'Next.js',
      'React Router',
      'Vue 3',
      'Nuxt',
      'SvelteKit',
      'Astro',
      'Angular',
      'SolidStart',
      'Remix',
    ],
  },
  {
    category: 'backend',
    label: 'Backend',
    hint: 'Tempat API, auth, AI jobs, dan penyimpanan berjalan.',
    options: [
      'Laravel API',
      'NestJS',
      'FastAPI',
      'Express.js',
      'Hono',
      'Django REST',
      'Ruby on Rails API',
      'Spring Boot',
      'Go Fiber',
      'ASP.NET Core API',
      'Supabase Edge Functions',
    ],
  },
  {
    category: 'database',
    label: 'Database',
    hint: 'Tempat project, jawaban, diagram, dan versi PRD disimpan.',
    options: [
      'MySQL',
      'PostgreSQL',
      'SQLite',
      'MongoDB',
      'Supabase Postgres',
      'PlanetScale MySQL',
      'Neon Postgres',
      'Firebase Firestore',
      'No database for MVP',
    ],
  },
]

export const defaultStack: StackDecision = {
  frontend: 'React 18 + TypeScript + Vite',
  backend: 'Laravel API',
  database: 'MySQL',
}

export function generateSummary(idea: string): ProductSummary {
  const text = idea.toLowerCase()
  const isRpl = includesAny(text, ['rpl', 'use case', 'erd', 'sequence', 'activity'])
  const isSaas = includesAny(text, ['saas', 'subscription', 'billing', 'team', 'pricing'])
  const isPersonal = includesAny(text, ['sendiri', 'pribadi', 'personal'])
  const hasDatabase = includesAny(text, ['database', 'data', 'user', 'login', 'auth', 'project', 'version', 'riwayat'])
  const hasAi = includesAny(text, ['ai', 'chatbot', 'generate', 'prompt'])
  const hasWorkflow = includesAny(text, ['flow', 'alur', 'diagram', 'mermaid', 'prd'])

  const projectType = isRpl
    ? 'RPL documentation tool'
    : isSaas
      ? 'SaaS product builder'
      : isPersonal
        ? 'personal product workspace'
        : 'AI product workspace'

  const complexity: ProductSummary['complexity'] =
    [hasDatabase, hasAi, hasWorkflow, isRpl, isSaas].filter(Boolean).length >= 4
      ? 'complex'
      : idea.length > 420
        ? 'medium'
        : 'simple'

  const recommendedStack: StackDecision = {
    frontend: text.includes('next') ? 'Next.js' : defaultStack.frontend,
    backend: text.includes('fastapi') ? 'FastAPI' : text.includes('nest') ? 'NestJS' : 'Laravel API',
    database: text.includes('postgres') || isSaas ? 'PostgreSQL' : hasDatabase ? 'MySQL' : 'SQLite',
  }

  return {
    title: 'AI PRD Builder',
    projectType,
    complexity,
    pitch:
      'User starts with a raw idea, the assistant thinks through the context, chooses or confirms the core stack, asks only relevant questions, then produces Mermaid diagrams and a PRD.',
    thinking: [
      `Detected project type: ${projectType}.`,
      hasAi
        ? 'AI is part of the core workflow, so questions must cover autonomy and revision control.'
        : 'AI is not assumed as a product feature unless the idea asks for it.',
      hasDatabase
        ? 'Persistent project context is likely needed, so an ERD may be useful.'
        : 'Database can stay lightweight unless the answers introduce saved records.',
      'Only frontend, backend, and database should be shown in manual stack selection.',
    ],
    signals: [
      hasAi ? 'AI-assisted PRD flow' : 'standard product flow',
      hasWorkflow ? 'diagram workflow' : 'lightweight workflow',
      hasDatabase ? 'persistent data' : 'low-storage MVP',
      isRpl ? 'RPL outputs' : 'product PRD output',
    ],
    risks: [
      'questions can feel generic if they ignore the project type',
      'diagram generation must be selective, not automatic for every diagram type',
      'revision patches must preserve approved context',
    ],
    recommendedStack,
  }
}

export function generateAdaptiveQuestions(summary: ProductSummary, mode: StackMode): AdaptiveQuestion[] {
  const questions: AdaptiveQuestion[] = [
    {
      id: 'mvp-focus',
      prompt: 'Bagian apa saja yang wajib masuk MVP pertama?',
      reason: 'Jawaban ini bisa lebih dari satu karena MVP biasanya gabungan fitur kecil.',
      mode: 'multiple',
      options: ['Chat ide', 'Stack decision', 'Pertanyaan adaptif', 'Mermaid scratchboard', 'Export PRD'],
    },
    {
      id: 'revision-style',
      prompt: 'Kalau user minta revisi kecil, sistem harus memperlakukannya sebagai apa?',
      reason: 'Ini satu keputusan utama untuk menjaga konteks tidak diulang dari awal.',
      mode: 'single',
      options: ['Patch kecil', 'Versi baru', 'Branch project', 'Tanya konfirmasi dulu'],
    },
    {
      id: 'data-depth',
      prompt: 'Seberapa kuat kebutuhan penyimpanan data pada versi awal?',
      reason: 'Jawaban ini membantu AI memutuskan apakah ERD perlu dibuat.',
      mode: 'single',
      optional: true,
      options: ['Tidak perlu database', 'Simpan project lokal', 'Simpan akun dan project', 'Butuh version history'],
    },
  ]

  if (summary.projectType.includes('RPL')) {
    questions.push({
      id: 'rpl-output',
      prompt: 'Dokumen RPL apa saja yang ingin ikut dihasilkan?',
      reason: 'Untuk RPL, output bisa lebih dari satu dan tidak semuanya wajib.',
      mode: 'multiple',
      optional: true,
      options: ['Use case', 'ERD', 'Activity diagram', 'Sequence diagram', 'Flowchart'],
    })
  } else {
    questions.push({
      id: 'roles',
      prompt: 'Role apa saja yang mungkin memakai produk ini?',
      reason: 'Role membantu AI memutuskan apakah use case diagram berguna.',
      mode: 'multiple',
      optional: true,
      options: ['Solo builder', 'Developer', 'Founder', 'Product manager', 'Mahasiswa', 'Admin reviewer'],
    })
  }

  if (mode !== 'manual') {
    questions.push({
      id: 'ai-autonomy',
      prompt: 'Seberapa jauh AI boleh mengambil keputusan tanpa konfirmasi?',
      reason: 'Ini satu pilihan karena menyangkut kontrol user.',
      mode: 'single',
      optional: true,
      options: ['Boleh pilih default', 'Harus beri alasan', 'Minta approve semua', 'Hanya beri saran'],
    })
  }

  questions.push({
    id: 'custom-constraint',
    prompt: 'Ada batasan khusus yang tidak boleh dilanggar?',
    reason: 'Boleh dikosongkan kalau belum ada batasan.',
    mode: 'text',
    optional: true,
    options: [],
  })

  return questions
}

export function selectDiagramTypes(summary: ProductSummary, stack: StackDecision, answers: AnswerMap): DiagramType[] {
  const diagrams: DiagramType[] = ['flowchart']
  const dataAnswer = answerText(answers['data-depth']).toLowerCase()
  const roles = toArray(answers.roles)
  const wantsRpl = toArray(answers['rpl-output'])
  const databaseLooksReal = !stack.database.toLowerCase().includes('no database')
  const needsData = databaseLooksReal && !dataAnswer.includes('tidak perlu')

  if (needsData || wantsRpl.includes('ERD') || summary.complexity === 'complex') {
    diagrams.push('erd')
  }

  if (roles.length > 1 || wantsRpl.includes('Use case') || summary.projectType.includes('SaaS')) {
    diagrams.push('usecase')
  }

  return diagrams
}

export function buildDiagram(
  type: DiagramType,
  summary: ProductSummary,
  stack: StackDecision,
  answers: AnswerMap,
) {
  if (type === 'erd') return buildErd(summary, stack)
  if (type === 'usecase') return buildUseCase(summary, answers)
  return buildFlowchart(summary, stack, answers)
}

export function buildDiagramMap(
  summary: ProductSummary,
  stack: StackDecision,
  answers: AnswerMap,
): DiagramMap {
  return Object.fromEntries(
    selectDiagramTypes(summary, stack, answers).map((type) => [type, buildDiagram(type, summary, stack, answers)]),
  ) as DiagramMap
}

export function buildPrd(
  summary: ProductSummary,
  stack: StackDecision,
  answers: AnswerMap,
  diagrams: DiagramMap,
  version: number,
) {
  const answered = Object.entries(answers)
    .filter(([, value]) => answerText(value).trim())
    .map(([key, value]) => `- ${key}: ${answerText(value)}`)
    .join('\n')

  const diagramList = Object.keys(diagrams).length
    ? Object.keys(diagrams)
        .map((type) => `- ${type}`)
        .join('\n')
    : '- No diagram approved yet.'

  return `# PRD: ${summary.title}

Version: v${version}
Status: Draft

## Thinking Summary

${summary.thinking.map((item) => `- ${item}`).join('\n')}

## Summary

${summary.pitch}

## Objective

Build an open source workspace that turns a raw idea into a usable PRD through a staged AI flow.

## Core Flow

1. User writes the idea in a chat-first intake.
2. AI summarizes the idea and suggests stack decisions.
3. User chooses AI, manual, or hybrid stack mode.
4. AI asks adaptive questions with single, multiple, optional, or free-text answers.
5. AI selects only the Mermaid diagrams that are useful.
6. User approves the scratchboard.
7. AI generates the final PRD and applies later revisions as patches.

## Selected Stack

- Frontend: ${stack.frontend}
- Backend: ${stack.backend}
- Database: ${stack.database}

## Answers

${answered || '- No adaptive answers yet.'}

## Mermaid Diagrams

${diagramList}

## Risks

${summary.risks.map((risk) => `- ${risk}`).join('\n')}

## Acceptance Criteria

- First screen is a focused idea chat box.
- Stack selector appears only for manual or hybrid modes.
- Stack selector contains only frontend, backend, and database.
- Adaptive questions can support single choice, multiple choice, optional answers, and text answers.
- Scratchboard generates flowchart, ERD, or use case only when useful.
- PRD revisions are applied without restarting the whole workflow.`
}

export function answerText(value: AnswerValue | undefined) {
  if (!value) return ''
  return Array.isArray(value) ? value.join(', ') : value
}

export function toArray(value: AnswerValue | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : value ? [value] : []
}

function buildFlowchart(summary: ProductSummary, stack: StackDecision, answers: AnswerMap) {
  const focus = safeLabel(answerText(answers['mvp-focus']) || 'Idea intake')
  return `flowchart TD
    IDEA["User writes raw idea"] --> THINK["AI thinking: ${safeLabel(summary.projectType)}"]
    THINK --> STACK{"Stack mode"}
    STACK -->|AI| AUTO["AI chooses ${safeLabel(stack.frontend)}, ${safeLabel(stack.backend)}, ${safeLabel(stack.database)}"]
    STACK -->|Manual or hybrid| PICK["User confirms core stack"]
    AUTO --> QUESTIONS["Adaptive questions"]
    PICK --> QUESTIONS
    QUESTIONS --> SCRATCH["Selective Mermaid scratchboard"]
    SCRATCH --> APPROVE{"Approved?"}
    APPROVE -->|Patch| SCRATCH
    APPROVE -->|Yes| PRD["Generate PRD"]
    FOCUS["MVP focus: ${focus}"] --> QUESTIONS`
}

function buildErd(_summary: ProductSummary, _stack: StackDecision) {
  return `erDiagram
    USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ IDEA_MESSAGES : has
    PROJECTS ||--o{ STACK_DECISIONS : has
    PROJECTS ||--o{ QUESTION_ANSWERS : has
    PROJECTS ||--o{ DIAGRAMS : has
    PROJECTS ||--o{ PRD_VERSIONS : has

    USERS {
      uuid id
      string name
      string email
    }

    PROJECTS {
      uuid id
      uuid user_id
      string title
      string status
      json context_summary
    }

    STACK_DECISIONS {
      uuid id
      uuid project_id
      string frontend
      string backend
      string database
      string mode
    }

    QUESTION_ANSWERS {
      uuid id
      uuid project_id
      string question_id
      string answer_mode
      json value
    }

    DIAGRAMS {
      uuid id
      uuid project_id
      string diagram_type
      text mermaid_source
      integer version
    }

    PRD_VERSIONS {
      uuid id
      uuid project_id
      text markdown
      integer version
      string status
    }`
}

function buildUseCase(summary: ProductSummary, answers: AnswerMap) {
  const roles = toArray(answers.roles)
  const actors = roles.length ? roles : ['User', 'AI Assistant']
  const actorNodes = actors
    .slice(0, 5)
    .map((role, index) => `    A${index}["${safeLabel(role)}"]`)
    .join('\n')
  const links = actors
    .slice(0, 5)
    .map((_, index) => `    A${index} --> UC1\n    A${index} --> UC2`)
    .join('\n')

  return `flowchart LR
${actorNodes}
    UC1((Describe idea))
    UC2((Answer adaptive questions))
    UC3((Approve diagrams))
    UC4((Export PRD))
    BOT["AI Assistant"] --> UC2
    BOT --> UC3
    BOT --> UC4
${links}
    UC2 --> NOTE["${safeLabel(summary.projectType)}"]`
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word))
}

function safeLabel(value: string | undefined) {
  return (value ?? '').replace(/["[\]{}]/g, '').slice(0, 90)
}