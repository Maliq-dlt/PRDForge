import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, Download, PencilLine, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MermaidDiagram } from '@/components/mermaid-diagram'
import { ActiveProviderBadge } from '@/components/app-sidebar'
import {
  ModeChoice,
  QuestionCard,
  StackDecisionView,
  StackPicker,
  StageShell,
  formatDiagramLabel,
} from '@/components/workspace'
import type { ApiProvider } from '@/lib/api'
import type { BackendStatus } from '@/lib/app-types'
import type {
  StackMode,
  StackDecision,
  StackCategory,
  AdaptiveQuestion,
  AnswerMap,
  DiagramType,
  DiagramMap,
} from '@/lib/prd-engine'

interface IntakeScreenProps {
  backendStatus: BackendStatus
  activeProvider: ApiProvider | null
  idea: string
  setIdea: (value: string) => void
  handleComposerKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  submitIdea: () => void
}

export function IntakeScreen({
  backendStatus,
  activeProvider,
  idea,
  setIdea,
  handleComposerKeyDown,
  submitIdea,
}: IntakeScreenProps) {
  return (
    <motion.section
      key="intake"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="intake-screen"
    >
      <div className="intake-status-row">
        <Badge variant="outline" className={backendStatus === 'online' ? 'backend-health online' : 'backend-health offline'}>
          {backendStatus === 'online' ? 'Backend online' : 'Backend offline'}
        </Badge>
        <ActiveProviderBadge provider={activeProvider} />
      </div>
      <div className="intake-mark" />
      <h1>Apa yang ingin Anda bangun?</h1>
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault()
          submitIdea()
        }}
      >
        <Textarea
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder="Tulis ide produk, flow, target fitur, dan stack yang sudah terpikir..."
          className="composer-input"
        />
        <Button type="submit" size="icon" className="composer-send" disabled={!idea.trim()}>
          <Send className="size-5" />
        </Button>
      </form>
    </motion.section>
  )
}

interface StackStageProps {
  stackMode: StackMode
  chooseStackMode: (mode: StackMode) => void
  selectedStack: StackDecision
  activeStackCategory: StackCategory
  setActiveStackCategory: (category: StackCategory) => void
  handleStackPick: (category: StackCategory, item: string) => void
  approveStack: () => void
}

export function StackStage({
  stackMode,
  chooseStackMode,
  selectedStack,
  activeStackCategory,
  setActiveStackCategory,
  handleStackPick,
  approveStack,
}: StackStageProps) {
  return (
    <StageShell
      eyebrow="Step 02"
      title="Pilih cara menentukan stack"
      action={
        <Button onClick={approveStack}>
          Lanjut
          <ArrowRight className="size-4" />
        </Button>
      }
    >
      <div className="mode-grid">
        <ModeChoice
          active={stackMode === 'hybrid'}
          title="Hybrid"
          description="AI memberi default, Anda bisa ubah."
          onClick={() => chooseStackMode('hybrid')}
        />
        <ModeChoice
          active={stackMode === 'ai'}
          title="Dipilih AI"
          description="Tidak perlu selector manual."
          onClick={() => chooseStackMode('ai')}
        />
        <ModeChoice
          active={stackMode === 'manual'}
          title="Manual"
          description="Anda pilih stack sendiri."
          onClick={() => chooseStackMode('manual')}
        />
      </div>

      {stackMode === 'ai' ? (
        <StackDecisionView stack={selectedStack} />
      ) : (
        <StackPicker
          activeCategory={activeStackCategory}
          selectedStack={selectedStack}
          onCategoryChange={setActiveStackCategory}
          onPick={handleStackPick}
        />
      )}
    </StageShell>
  )
}

interface QuestionsStageProps {
  questions: AdaptiveQuestion[]
  answeredCount: number
  answers: AnswerMap
  customAnswers: Record<string, string>
  setQuestionAnswer: (q: AdaptiveQuestion, val: string) => void
  setTextAnswer: (id: string, val: string) => void
  setCustomAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>
  addCustomAnswer: (q: AdaptiveQuestion) => void
  skipQuestion: (id: string) => void
  prepareScratchboard: () => void
}

export function QuestionsStage({
  questions,
  answeredCount,
  answers,
  customAnswers,
  setQuestionAnswer,
  setTextAnswer,
  setCustomAnswers,
  addCustomAnswer,
  skipQuestion,
  prepareScratchboard,
}: QuestionsStageProps) {
  return (
    <StageShell
      eyebrow="Step 03"
      title="Jawab pertanyaan adaptif"
      meta={`${answeredCount}/${questions.length} terisi`}
      action={
        <Button onClick={prepareScratchboard}>
          Buat scratchboard
          <ArrowRight className="size-4" />
        </Button>
      }
    >
      <div className="question-list">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            value={answers[question.id]}
            customValue={customAnswers[question.id] ?? ''}
            onAnswer={(value) => setQuestionAnswer(question, value)}
            onTextAnswer={(value) => setTextAnswer(question.id, value)}
            onCustomChange={(value) =>
              setCustomAnswers((current) => ({ ...current, [question.id]: value }))
            }
            onAddCustom={() => addCustomAnswer(question)}
            onSkip={() => skipQuestion(question.id)}
          />
        ))}
      </div>
    </StageShell>
  )
}

interface ScratchboardStageProps {
  availableDiagrams: DiagramType[]
  activeDiagram: DiagramType
  setActiveDiagram: (type: DiagramType) => void
  diagrams: DiagramMap
  updateDiagram: (type: DiagramType, val: string) => void
  regenerateScratchboard: () => void
  approveScratchboard: () => void
}

export function ScratchboardStage({
  availableDiagrams,
  activeDiagram,
  setActiveDiagram,
  diagrams,
  updateDiagram,
  regenerateScratchboard,
  approveScratchboard,
}: ScratchboardStageProps) {
  return (
    <StageShell
      eyebrow="Step 04"
      title="Scratchboard Mermaid"
      meta={availableDiagrams.map(formatDiagramLabel).join(', ')}
      action={
        <div className="stage-actions">
          <Button variant="outline" onClick={regenerateScratchboard}>
            Generate ulang
          </Button>
          <Button onClick={approveScratchboard}>
            Approve PRD
            <ArrowRight className="size-4" />
          </Button>
        </div>
      }
    >
      <div className="diagram-choice-row">
        {availableDiagrams.map((type) => (
          <Badge key={type} variant={type === activeDiagram ? 'default' : 'outline'}>
            {formatDiagramLabel(type)}
          </Badge>
        ))}
      </div>
      <Tabs value={activeDiagram} onValueChange={(value) => setActiveDiagram(value as DiagramType)}>
        <TabsList>
          {availableDiagrams.map((type) => (
            <TabsTrigger key={type} value={type}>
              {formatDiagramLabel(type)}
            </TabsTrigger>
          ))}
        </TabsList>
        {availableDiagrams.map((type) => (
          <TabsContent key={type} value={type}>
            <div className="diagram-grid">
              <MermaidDiagram chart={diagrams[type] ?? ''} />
              <Textarea
                className="diagram-source"
                value={diagrams[type] ?? ''}
                onChange={(event) => updateDiagram(type, event.target.value)}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </StageShell>
  )
}

interface PrdStageProps {
  prd: string
  version: number
  revision: string
  setRevision: (val: string) => void
  exportMarkdown: () => void
  applyRevision: () => void
}

export function PrdStage({
  prd,
  version,
  revision,
  setRevision,
  exportMarkdown,
  applyRevision,
}: PrdStageProps) {
  return (
    <StageShell
      eyebrow="Step 05"
      title="PRD Markdown"
      meta={`v${version}`}
      action={
        <Button onClick={exportMarkdown}>
          <Download className="size-4" />
          Export MD
        </Button>
      }
    >
      <pre className="prd-output">{prd}</pre>
      <div className="revision-box">
        <div className="revision-title">
          <PencilLine className="size-4" />
          Patch tanpa ulang dari awal
        </div>
        <Textarea
          value={revision}
          onChange={(event) => setRevision(event.target.value)}
          placeholder="Contoh: tambahkan export PDF dan role admin reviewer."
          className="revision-input"
        />
        <Button onClick={applyRevision} disabled={!revision.trim()}>
          <Bot className="size-4" />
          Terapkan revisi
        </Button>
      </div>
    </StageShell>
  )
}
