import { Bot, Check, ChevronRight, Database, Download, Menu, Network, Sparkles, Workflow } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ActiveProviderBadge } from '@/components/app-sidebar'
import type { ApiProvider } from '@/lib/api'
import type { BackendStatus } from '@/lib/app-types'
import { type AdaptiveQuestion, type DiagramType, type ProductSummary, type QuestionMode, type StackCategory, type StackDecision, stackCatalog, toArray, answerText } from '@/lib/prd-engine'

export type FlowStage = 'intake' | 'stack' | 'questions' | 'scratchboard' | 'prd'

export const stageOrder: FlowStage[] = ['intake', 'stack', 'questions', 'scratchboard', 'prd']
export const stageLabels: Record<FlowStage, string> = {
  intake: 'Idea',
  stack: 'Stack',
  questions: 'Questions',
  scratchboard: 'Scratchboard',
  prd: 'PRD',
}
const categoryIcons: Record<StackCategory, ReactNode> = {
  frontend: <Workflow className="size-4" />,
  backend: <Network className="size-4" />,
  database: <Database className="size-4" />,
}

export function AppHeader({
  version,
  canExport,
  activeProvider,
  backendStatus,
  onExport,
  onOpenSidebar,
  onOpenSettings,
}: {
  version: number
  canExport: boolean
  activeProvider: ApiProvider | null
  backendStatus: BackendStatus
  onExport: () => void
  onOpenSidebar: () => void
  onOpenSettings: () => void
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <Button type="button" variant="ghost" size="icon" className="mobile-sidebar-toggle" onClick={onOpenSidebar}>
          <Menu className="size-5" />
        </Button>
        <div className="brand-lockup topbar-brand">
          <div className="brand-orbit" />
          <span>AI PRD Builder</span>
        </div>
      </div>
      <div className="topbar-actions">
        <Badge variant="outline" className={backendStatus === 'online' ? 'topbar-badge verified-status' : 'topbar-badge muted-status'}>
          {backendStatus === 'online' ? 'API online' : 'API offline'}
        </Badge>
        <ActiveProviderBadge provider={activeProvider} />
        <Badge variant="outline" className="topbar-badge">
          v{version}
        </Badge>
        <Button type="button" size="sm" variant="secondary" onClick={onOpenSettings}>
          Settings
        </Button>
        {canExport ? (
          <Button type="button" size="sm" onClick={onExport}>
            <Download className="size-4" />
            Export
          </Button>
        ) : null}
      </div>
    </header>
  )
}

export function StageRail({
  activeStage,
  activeStageIndex,
}: {
  activeStage: string
  activeStageIndex: number
}) {
  return (
    <nav className="stage-rail" aria-label="Workflow stages">
      {stageOrder.map((item, index) => (
        <div
          key={item}
          className={[
            'stage-pill',
            item === activeStage ? 'stage-pill-active' : '',
            index < activeStageIndex ? 'stage-pill-done' : '',
          ].join(' ')}
        >
          <span>{String(index + 1).padStart(2, '0')}</span>
          {stageLabels[item]}
        </div>
      ))}
    </nav>
  )
}

export function ThinkingPanel({ idea, summary }: { idea: string; summary: ProductSummary }) {
  return (
    <section className="thinking-panel">
      <div className="chat-row user-row">
        <div className="avatar user-avatar">U</div>
        <p>{idea}</p>
      </div>
      <div className="chat-row assistant-row">
        <div className="avatar assistant-avatar">
          <Sparkles className="size-4" />
        </div>
        <div>
          <div className="thinking-title">Thinking</div>
          <ul>
            {summary.thinking.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function StageShell({
  eyebrow,
  title,
  meta,
  action,
  children,
}: {
  eyebrow: string
  title: string
  meta?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="stage-shell">
      <div className="stage-header">
        <div>
          <p className="stage-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {meta ? <p className="stage-meta">{meta}</p> : null}
        </div>
        {action ? <div className="stage-action-slot">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function ModeChoice({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button type="button" className={active ? 'mode-choice mode-choice-active' : 'mode-choice'} onClick={onClick}>
      <span className="mode-dot">{active ? <Check className="size-3" /> : null}</span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </button>
  )
}

export function StackDecisionView({ stack }: { stack: StackDecision }) {
  return (
    <div className="ai-stack-view">
      <div className="ai-stack-copy">
        <Bot className="size-5" />
        <span>AI memilih stack inti dari konteks ide.</span>
      </div>
      <StackSummary stack={stack} />
    </div>
  )
}

export function StackPicker({
  activeCategory,
  selectedStack,
  onCategoryChange,
  onPick,
}: {
  activeCategory: StackCategory
  selectedStack: StackDecision
  onCategoryChange: (category: StackCategory) => void
  onPick: (category: StackCategory, value: string) => void
}) {
  const activeItem = stackCatalog.find((item) => item.category === activeCategory) ?? stackCatalog[0]

  return (
    <div className="stack-picker">
      <StackSummary stack={selectedStack} />
      <div className="stack-category-tabs">
        {stackCatalog.map((item) => (
          <button
            key={item.category}
            type="button"
            className={activeCategory === item.category ? 'stack-category active' : 'stack-category'}
            onClick={() => onCategoryChange(item.category)}
          >
            {categoryIcons[item.category]}
            <span>{item.label}</span>
            <ChevronRight className="size-4" />
          </button>
        ))}
      </div>
      <div className="stack-options-panel">
        <div className="stack-options-heading">
          <span>{activeItem.label}</span>
          <small>{activeItem.hint}</small>
        </div>
        <div className="stack-options">
          {activeItem.options.map((option) => (
            <button
              key={option}
              type="button"
              className={selectedStack[activeItem.category] === option ? 'stack-option selected' : 'stack-option'}
              onClick={() => onPick(activeItem.category, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function StackSummary({ stack }: { stack: StackDecision }) {
  return (
    <div className="stack-summary">
      {(Object.keys(stack) as StackCategory[]).map((category) => (
        <div key={category}>
          <small>{category}</small>
          <strong>{stack[category]}</strong>
        </div>
      ))}
    </div>
  )
}

export function QuestionCard({
  question,
  value,
  customValue,
  onAnswer,
  onTextAnswer,
  onCustomChange,
  onAddCustom,
  onSkip,
}: {
  question: AdaptiveQuestion
  value: string | string[] | undefined
  customValue: string
  onAnswer: (value: string) => void
  onTextAnswer: (value: string) => void
  onCustomChange: (value: string) => void
  onAddCustom: () => void
  onSkip: () => void
}) {
  const selectedValues = toArray(value)

  return (
    <article className="question-card">
      <div className="question-head">
        <div>
          <div className="question-kicker">
            <Badge variant="outline">{questionModeLabel(question.mode)}</Badge>
            {question.optional ? <Badge variant="outline">optional</Badge> : null}
          </div>
          <h3>{question.prompt}</h3>
          <p>{question.reason}</p>
        </div>
        {answerText(value).trim() ? <Check className="size-5 text-primary" /> : null}
      </div>

      {question.mode === 'text' ? (
        <Textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onTextAnswer(event.target.value)}
          placeholder="Tulis jawaban bebas atau biarkan kosong."
          className="question-textarea"
        />
      ) : (
        <div className="answer-options">
          {question.options.map((option) => {
            const selected = selectedValues.includes(option)
            return (
              <button
                key={option}
                type="button"
                className={selected ? 'answer-chip selected' : 'answer-chip'}
                onClick={() => onAnswer(option)}
              >
                {selected ? <Check className="size-3" /> : null}
                {option}
              </button>
            )
          })}
        </div>
      )}

      {question.mode !== 'text' ? (
        <div className="custom-answer-row">
          <Input
            value={customValue}
            onChange={(event) => onCustomChange(event.target.value)}
            placeholder="Lainnya"
          />
          <Button variant="secondary" onClick={onAddCustom} disabled={!customValue.trim()}>
            Tambah
          </Button>
        </div>
      ) : null}

      <div className="question-foot">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Lewati
        </Button>
      </div>
    </article>
  )
}

export function questionModeLabel(mode: QuestionMode) {
  if (mode === 'multiple') return 'multi'
  if (mode === 'single') return 'single'
  return 'text'
}

export function formatDiagramLabel(type: DiagramType) {
  if (type === 'erd') return 'ERD'
  if (type === 'usecase') return 'Use case'
  return 'Flowchart'
}
