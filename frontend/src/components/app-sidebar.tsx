import {
  Bot,
  CheckCircle2,
  Clock3,
  FolderKanban,
  History,
  LogOut,
  MessageSquarePlus,
  Search,
  Settings,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'

import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ApiProject, ApiProvider, ConversationHistoryItem } from '@/lib/api'
import type { BackendStatus } from '@/lib/app-types'

type AppSidebarProps = {
  open: boolean
  backendStatus: BackendStatus
  activeProvider: ApiProvider | null
  projects: ApiProject[]
  history: ConversationHistoryItem[]
  onClose: () => void
  onNewProject: () => void
  onOpenSettings: () => void
  onSelectHistory: (item: ConversationHistoryItem) => void
  onLogout: () => void
}

export function AppSidebar({
  open,
  backendStatus,
  activeProvider,
  projects,
  history,
  onClose,
  onNewProject,
  onOpenSettings,
  onSelectHistory,
  onLogout,
}: AppSidebarProps) {
  return (
    <>
      <aside className={open ? 'app-sidebar app-sidebar-open' : 'app-sidebar'} aria-label="Workspace sidebar">
        <div className="sidebar-head">
          <div className="sidebar-brand">
            <div className="brand-orbit" />
            <span>AI PRD Builder</span>
          </div>
          <Button type="button" variant="ghost" size="icon" className="sidebar-close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="sidebar-primary-actions">
          <Button type="button" className="sidebar-action-main" onClick={onNewProject}>
            <MessageSquarePlus className="size-4" />
            Project baru
          </Button>
          <button type="button" className="sidebar-soft-action">
            <Search className="size-4" />
            Cari history
          </button>
        </div>

        <div className="sidebar-scroll-area">
          <SidebarSection title="History" icon={<History className="size-4" />}>
            {history.length ? (
              history.slice(0, 7).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="history-item"
                  onClick={() => onSelectHistory(item)}
                >
                  <span>{historyTitle(item)}</span>
                  <small>{formatCompactDate(item.createdAt)}</small>
                </button>
              ))
            ) : (
              <p className="sidebar-empty">Belum ada percakapan tersimpan.</p>
            )}
          </SidebarSection>

          <SidebarSection title="Projects" icon={<FolderKanban className="size-4" />}>
            {projects.length ? (
              projects.slice(0, 6).map((project) => (
                <button type="button" key={project.id} className="project-item">
                  <span>{project.name}</span>
                  <small>
                    {project.currentStage} - {project.messageCount ?? 0} pesan
                  </small>
                </button>
              ))
            ) : (
              <p className="sidebar-empty">Project akan muncul setelah backend aktif.</p>
            )}
          </SidebarSection>
        </div>

        <div className="sidebar-footer">
          <div className="provider-mini-card">
            <div className="provider-mini-top">
              <span className="provider-mini-icon">
                <Bot className="size-4" />
              </span>
              <div>
                <strong>{activeProvider?.name ?? 'AI belum dipilih'}</strong>
                <small>{activeProvider ? providerStatusLabel(activeProvider.status) : 'Atur provider'}</small>
              </div>
            </div>
            <Badge variant="outline" className={backendStatus === 'online' ? 'api-badge online' : 'api-badge offline'}>
              {backendStatus === 'online' ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
              {backendStatusLabel(backendStatus)}
            </Badge>
          </div>

          <button type="button" className="settings-entry" onClick={onOpenSettings}>
            <Settings className="size-4" />
            Settings
          </button>

          <button type="button" className="settings-entry text-red-400 hover:text-red-300" onClick={onLogout}>
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>
      {open ? <button type="button" className="sidebar-backdrop" aria-label="Tutup sidebar" onClick={onClose} /> : null}
    </>
  )
}

function SidebarSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="sidebar-section">
      <div className="sidebar-section-title">
        {icon}
        <span>{title}</span>
      </div>
      <div className="sidebar-section-body">{children}</div>
    </section>
  )
}

function historyTitle(item: ConversationHistoryItem) {
  const content = item.content.trim().replace(/\s+/g, ' ')
  if (!content) return item.role === 'assistant' ? 'Respons AI' : 'Catatan user'
  return content.length > 58 ? `${content.slice(0, 58)}...` : content
}

function formatCompactDate(value: string | null) {
  if (!value) return 'baru'

  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'baru'
  }
}

function backendStatusLabel(status: BackendStatus) {
  if (status === 'online') return 'API online'
  if (status === 'checking') return 'Checking'
  return 'API offline'
}

function providerStatusLabel(status: string) {
  if (status === 'verified') return 'Terverifikasi'
  if (status === 'error') return 'Perlu dicek'
  return 'Belum diverifikasi'
}

export function ActiveProviderBadge({ provider }: { provider: ApiProvider | null }) {
  if (!provider) {
    return (
      <Badge variant="outline" className="topbar-badge muted-status">
        <Clock3 className="size-3" />
        No AI
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={provider.status === 'verified' ? 'topbar-badge verified-status' : 'topbar-badge muted-status'}>
      {provider.status === 'verified' ? <CheckCircle2 className="size-3" /> : <Clock3 className="size-3" />}
      {provider.name}
    </Badge>
  )
}