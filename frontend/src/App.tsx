import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import { SettingsDialog } from '@/components/settings-dialog'
import {
  AppHeader,
  StageRail,
  ThinkingPanel,
  stageOrder,
  type FlowStage,
} from '@/components/workspace'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import {
  IntakeScreen,
  StackStage,
  QuestionsStage,
  ScratchboardStage,
  PrdStage,
} from '@/components/flow-stages'
import { useLenis } from '@/hooks/use-lenis'
import type { BackendStatus, ProviderDraft, SettingsTab } from '@/lib/app-types'
import {
  loadBootstrap,
  updateProvider,
  verifyProvider,
  apiBaseUrl,
  type ApiProject,
  type ApiProvider,
  type BootstrapViewModel,
  type ConversationHistoryItem,
  type HealthSnapshot,
} from '@/lib/api'
import { useAppStore } from '@/stores/use-app-store'
import {
  answerText,
  buildDiagramMap,
  buildPrd,
  defaultStack,
  generateAdaptiveQuestions,
  generateSummary,
  toArray,
  type AdaptiveQuestion,
  type AnswerMap,
  type DiagramMap,
  type DiagramType,
  type ProductSummary,
  type StackCategory,
  type StackDecision,
  type StackMode,
} from '@/lib/prd-engine'



const fallbackProviders: ApiProvider[] = [
  {
    id: -1,
    name: 'Local LLM',
    provider: 'local',
    authType: 'local_endpoint',
    model: 'llama-compatible',
    endpointUrl: 'http://127.0.0.1:11434/v1',
    status: 'unverified',
    apiKeyConfigured: false,
    quota: { limit: null, used: 0, remaining: null, resetAt: null },
    lastVerifiedAt: null,
    metadata: {},
    updatedAt: null,
  },
]

const fallbackProjects: ApiProject[] = [
  {
    id: -1,
    name: 'AI PRD Builder',
    status: 'local',
    currentStage: 'intake',
    summary: 'Workspace lokal untuk membuat PRD dari chat, stack, pertanyaan adaptif, dan Mermaid.',
    stackDecision: defaultStack,
    metadata: {},
    messageCount: 0,
    updatedAt: null,
  },
]

function App() {
  useLenis()

  const [stage, setStage] = useState<FlowStage>('intake')
  const [idea, setIdea] = useState('')
  const [summary, setSummary] = useState<ProductSummary | null>(null)
  const [stackMode, setStackMode] = useState<StackMode>('hybrid')
  const [selectedStack, setSelectedStack] = useState<StackDecision>(defaultStack)
  const [activeStackCategory, setActiveStackCategory] = useState<StackCategory>('frontend')
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({})
  const [diagrams, setDiagrams] = useState<DiagramMap>({})
  const [activeDiagram, setActiveDiagram] = useState<DiagramType>('flowchart')
  const [prd, setPrd] = useState('')
  const [version, setVersion] = useState(1)
  const [revision, setRevision] = useState('')

  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const settingsOpen = useAppStore((state) => state.settingsOpen)
  const setSettingsOpen = useAppStore((state) => state.setSettingsOpen)

  const logoutUser = useAppStore((state) => state.logoutUser)
  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${apiBaseUrl()}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
    } catch (e) {
      console.error('API logout failed', e)
    } finally {
      logoutUser()
    }
  }, [logoutUser])

  const [settingsTab, setSettingsTab] = useState<SettingsTab>('ai')
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking')
  const [backendLatency, setBackendLatency] = useState<number | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)
  const [health, setHealth] = useState<HealthSnapshot | null>(null)
  const [providers, setProviders] = useState<ApiProvider[]>(fallbackProviders)
  const [projects, setProjects] = useState<ApiProject[]>(fallbackProjects)
  const [history, setHistory] = useState<ConversationHistoryItem[]>([])
  const [settingsData, setSettingsData] = useState<BootstrapViewModel['settings'] | null>(null)
  const [providerDrafts, setProviderDrafts] = useState<Record<number, ProviderDraft>>(() => hydrateDrafts(fallbackProviders))
  const [savingProviderId, setSavingProviderId] = useState<number | null>(null)
  const [verifyingProviderId, setVerifyingProviderId] = useState<number | null>(null)

  const questions = useMemo<AdaptiveQuestion[]>(
    () => (summary ? generateAdaptiveQuestions(summary, stackMode) : []),
    [summary, stackMode],
  )

  const answeredCount = questions.filter((question) => answerText(answers[question.id]).trim()).length
  const availableDiagrams = Object.keys(diagrams) as DiagramType[]
  const activeStageIndex = stageOrder.indexOf(stage)
  const activeProvider = useMemo(
    () => providers.find((provider) => provider.status === 'verified') ?? providers[0] ?? null,
    [providers],
  )

  const refreshBackend = useCallback(async () => {
    const startedAt = performance.now()

    try {
      const bootstrap = await loadBootstrap()
      const nextProviders = bootstrap.providers.length ? bootstrap.providers : fallbackProviders
      const nextProjects = bootstrap.projects.length ? bootstrap.projects : fallbackProjects

      setProviders(nextProviders)
      setProjects(nextProjects)
      setHistory(bootstrap.history)
      setSettingsData(bootstrap.settings)
      setHealth(bootstrap.health)
      setProviderDrafts(hydrateDrafts(nextProviders))
      setBackendStatus('online')
      setBackendLatency(Math.round(performance.now() - startedAt))
      setBackendError(null)
    } catch (error) {
      setBackendStatus('offline')
      setBackendLatency(null)
      setBackendError(`Backend Laravel belum terhubung: ${readError(error)}`)
    }
  }, [])

  useEffect(() => {
    void refreshBackend()
  }, [refreshBackend])

  function resetWorkspace() {
    setStage('intake')
    setIdea('')
    setSummary(null)
    setStackMode('hybrid')
    setSelectedStack(defaultStack)
    setAnswers({})
    setCustomAnswers({})
    setDiagrams({})
    setPrd('')
    setRevision('')
    setVersion(1)
    setSidebarOpen(false)
  }

  function handleSelectHistory(item: ConversationHistoryItem) {
    setIdea(item.content)
    setStage('intake')
    setSidebarOpen(false)
  }

  function openSettings(tab: SettingsTab = 'ai') {
    setSettingsTab(tab)
    setSettingsOpen(true)
    setSidebarOpen(false)
  }

  function submitIdea() {
    const trimmed = idea.trim()
    if (!trimmed) return

    const nextSummary = generateSummary(trimmed)
    setSummary(nextSummary)
    setSelectedStack(nextSummary.recommendedStack)
    setStackMode('hybrid')
    setAnswers({})
    setCustomAnswers({})
    setDiagrams({})
    setPrd('')
    setRevision('')
    setVersion(1)
    setActiveStackCategory('frontend')
    setStage('stack')
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitIdea()
    }
  }

  function chooseStackMode(mode: StackMode) {
    setStackMode(mode)
    if (summary && mode === 'ai') {
      setSelectedStack(summary.recommendedStack)
    }
  }

  function handleStackPick(category: StackCategory, value: string) {
    setSelectedStack((current) => ({
      ...current,
      [category]: value,
    }))
  }

  function approveStack() {
    if (!summary) return
    setStage('questions')
  }

  function setQuestionAnswer(question: AdaptiveQuestion, value: string) {
    setAnswers((current) => {
      if (question.mode === 'multiple') {
        const currentValues = toArray(current[question.id])
        const exists = currentValues.includes(value)
        return {
          ...current,
          [question.id]: exists
            ? currentValues.filter((item) => item !== value)
            : [...currentValues, value],
        }
      }

      return {
        ...current,
        [question.id]: value,
      }
    })
  }

  function setTextAnswer(questionId: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }))
  }

  function addCustomAnswer(question: AdaptiveQuestion) {
    const value = customAnswers[question.id]?.trim()
    if (!value) return
    setQuestionAnswer(question, value)
    setCustomAnswers((current) => ({
      ...current,
      [question.id]: '',
    }))
  }

  function skipQuestion(questionId: string) {
    setAnswers((current) => {
      const next = { ...current }
      delete next[questionId]
      return next
    })
  }

  function prepareScratchboard() {
    if (!summary) return
    const nextDiagrams = buildDiagramMap(summary, selectedStack, answers)
    const firstDiagram = (Object.keys(nextDiagrams)[0] as DiagramType | undefined) ?? 'flowchart'
    setDiagrams(nextDiagrams)
    setActiveDiagram(firstDiagram)
    setStage('scratchboard')
  }

  function updateDiagram(type: DiagramType, value: string) {
    setDiagrams((current) => ({
      ...current,
      [type]: value,
    }))
  }

  function regenerateScratchboard() {
    if (!summary) return
    const nextDiagrams = buildDiagramMap(summary, selectedStack, answers)
    const firstDiagram = (Object.keys(nextDiagrams)[0] as DiagramType | undefined) ?? 'flowchart'
    setDiagrams(nextDiagrams)
    setActiveDiagram(firstDiagram)
  }

  function approveScratchboard() {
    if (!summary) return
    setPrd(buildPrd(summary, selectedStack, answers, diagrams, version))
    setStage('prd')
  }

  function applyRevision() {
    const trimmed = revision.trim()
    if (!trimmed || !summary) return

    const nextVersion = version + 1
    setVersion(nextVersion)
    setPrd((current) =>
      `${current}\n\n## Revision Patch v${nextVersion}\n\n- User request: ${trimmed}\n- Patch behavior: update only affected PRD and diagram context. Do not restart the whole flow.\n`,
    )
    setRevision('')
  }

  function exportMarkdown() {
    if (!prd) return
    const blob = new Blob([prd], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `AI-PRD-Builder-v${version}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  function updateProviderDraft(providerId: number, field: keyof ProviderDraft, value: string) {
    const provider = providers.find((item) => item.id === providerId)
    setProviderDrafts((current) => ({
      ...current,
      [providerId]: {
        ...(current[providerId] ?? draftFromProvider(provider)),
        [field]: value,
      },
    }))
  }

  async function saveProvider(provider: ApiProvider) {
    if (provider.id < 0) return
    setSavingProviderId(provider.id)
    setBackendError(null)

    try {
      const updated = await updateProvider(provider.id, payloadFromDraft(providerDrafts[provider.id] ?? draftFromProvider(provider)))
      mergeProvider(updated)
    } catch (error) {
      setBackendError(`Gagal menyimpan provider: ${readError(error)}`)
    } finally {
      setSavingProviderId(null)
    }
  }

  async function verifyProviderConnection(provider: ApiProvider) {
    if (provider.id < 0) return
    setVerifyingProviderId(provider.id)
    setBackendError(null)

    try {
      const draft = providerDrafts[provider.id] ?? draftFromProvider(provider)
      const saved = await updateProvider(provider.id, payloadFromDraft(draft))
      mergeProvider(saved)
      const verified = await verifyProvider(saved.id)
      mergeProvider(verified)
      await refreshBackend()
    } catch (error) {
      setBackendError(`Verifikasi provider gagal: ${readError(error)}`)
    } finally {
      setVerifyingProviderId(null)
    }
  }

  function mergeProvider(provider: ApiProvider) {
    setProviders((current) => current.map((item) => (item.id === provider.id ? provider : item)))
    setProviderDrafts((current) => ({
      ...current,
      [provider.id]: draftFromProvider(provider),
    }))
  }

  return (
    <ErrorBoundary>
      <main className="app-shell min-h-screen bg-background text-foreground">
        <div className="penumbra-grid" />
      <AppSidebar
        open={sidebarOpen}
        backendStatus={backendStatus}
        activeProvider={activeProvider}
        projects={projects}
        history={history}
        onClose={() => setSidebarOpen(false)}
        onNewProject={resetWorkspace}
        onOpenSettings={() => openSettings('ai')}
        onSelectHistory={handleSelectHistory}
        onLogout={handleLogout}
      />

      <section className="app-main">
        <AppHeader
          version={version}
          canExport={Boolean(prd)}
          activeProvider={activeProvider}
          backendStatus={backendStatus}
          onExport={exportMarkdown}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSettings={() => openSettings('ai')}
        />

        <AnimatePresence mode="wait">
        {stage === 'intake' ? (
          <IntakeScreen
            backendStatus={backendStatus}
            activeProvider={activeProvider}
            idea={idea}
            setIdea={setIdea}
            handleComposerKeyDown={handleComposerKeyDown}
            submitIdea={submitIdea}
          />
        ) : (
          <motion.section
            key="workspace"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="workspace-flow"
          >
            <StageRail activeStage={stage} activeStageIndex={activeStageIndex} />

            {summary ? (
              <ThinkingPanel idea={idea} summary={summary} />
            ) : null}

            {summary && stage === 'stack' ? (
              <StackStage
                stackMode={stackMode}
                chooseStackMode={chooseStackMode}
                selectedStack={selectedStack}
                activeStackCategory={activeStackCategory}
                setActiveStackCategory={setActiveStackCategory}
                handleStackPick={handleStackPick}
                approveStack={approveStack}
              />
            ) : null}

            {summary && stage === 'questions' ? (
              <QuestionsStage
                questions={questions}
                answeredCount={answeredCount}
                answers={answers}
                customAnswers={customAnswers}
                setQuestionAnswer={setQuestionAnswer}
                setTextAnswer={setTextAnswer}
                setCustomAnswers={setCustomAnswers}
                addCustomAnswer={addCustomAnswer}
                skipQuestion={skipQuestion}
                prepareScratchboard={prepareScratchboard}
              />
            ) : null}

            {summary && stage === 'scratchboard' ? (
              <ScratchboardStage
                availableDiagrams={availableDiagrams}
                activeDiagram={activeDiagram}
                setActiveDiagram={setActiveDiagram}
                diagrams={diagrams}
                updateDiagram={updateDiagram}
                regenerateScratchboard={regenerateScratchboard}
                approveScratchboard={approveScratchboard}
              />
            ) : null}

            {summary && stage === 'prd' ? (
              <PrdStage
                prd={prd}
                version={version}
                revision={revision}
                setRevision={setRevision}
                exportMarkdown={exportMarkdown}
                applyRevision={applyRevision}
              />
            ) : null}
          </motion.section>
        )}
        </AnimatePresence>
      </section>

      <SettingsDialog
        open={settingsOpen}
        activeTab={settingsTab}
        backendStatus={backendStatus}
        backendLatency={backendLatency}
        backendError={backendError}
        providers={providers}
        providerDrafts={providerDrafts}
        activeProvider={activeProvider}
        settings={settingsData}
        health={health}
        savingProviderId={savingProviderId}
        verifyingProviderId={verifyingProviderId}
        onClose={() => setSettingsOpen(false)}
        onTabChange={setSettingsTab}
        onDraftChange={updateProviderDraft}
        onSaveProvider={saveProvider}
        onVerifyProvider={verifyProviderConnection}
        onRefresh={refreshBackend}
      />
      </main>
    </ErrorBoundary>
  )
}


function hydrateDrafts(providers: ApiProvider[]) {
  return providers.reduce<Record<number, ProviderDraft>>((drafts, provider) => {
    drafts[provider.id] = draftFromProvider(provider)
    return drafts
  }, {})
}

function draftFromProvider(provider?: ApiProvider): ProviderDraft {
  return {
    model: provider?.model ?? '',
    endpointUrl: provider?.endpointUrl ?? '',
    apiKey: '',
    quotaLimit: provider?.quota.limit === null || provider?.quota.limit === undefined ? '' : String(provider.quota.limit),
  }
}

function payloadFromDraft(draft: ProviderDraft) {
  const payload: Parameters<typeof updateProvider>[1] = {
    model: draft.model.trim(),
    endpointUrl: draft.endpointUrl.trim(),
    quotaLimit: draft.quotaLimit.trim() ? Number(draft.quotaLimit) : null,
  }

  if (draft.apiKey.trim()) {
    payload.apiKey = draft.apiKey.trim()
  }

  return payload
}

function readError(error: unknown) {
  if (error instanceof Error) return error.message
  return 'unknown error'
}
export default App