import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  Bell,
  CheckCircle2,
  HardDrive,
  KeyRound,
  PlugZap,
  Settings,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ApiProvider, BootstrapViewModel, HealthSnapshot } from '@/lib/api'
import type { BackendStatus, ProviderDraft, SettingsTab } from '@/lib/app-types'
import {
  GeneralPanel,
  AiPanel,
  StoragePanel,
  NotificationsPanel,
  ApplicationsPanel,
  SystemPanel,
} from './settings-panels'

type SettingsDialogProps = {
  open: boolean
  activeTab: SettingsTab
  backendStatus: BackendStatus
  backendLatency: number | null
  backendError: string | null
  providers: ApiProvider[]
  providerDrafts: Record<number, ProviderDraft>
  activeProvider: ApiProvider | null
  settings: BootstrapViewModel['settings'] | null
  health: HealthSnapshot | null
  savingProviderId: number | null
  verifyingProviderId: number | null
  onClose: () => void
  onTabChange: (tab: SettingsTab) => void
  onDraftChange: (providerId: number, field: keyof ProviderDraft, value: string) => void
  onSaveProvider: (provider: ApiProvider) => void
  onVerifyProvider: (provider: ApiProvider) => void
  onRefresh: () => void
}

const tabs: Array<{ id: SettingsTab; label: string; icon: ReactNode }> = [
  { id: 'general', label: 'Umum', icon: <Settings className="size-4" /> },
  { id: 'ai', label: 'AI Provider', icon: <KeyRound className="size-4" /> },
  { id: 'storage', label: 'Penyimpanan', icon: <HardDrive className="size-4" /> },
  { id: 'notifications', label: 'Notifikasi', icon: <Bell className="size-4" /> },
  { id: 'apps', label: 'Aplikasi', icon: <PlugZap className="size-4" /> },
  { id: 'system', label: 'System check', icon: <Activity className="size-4" /> },
]

export function SettingsDialog({
  open,
  activeTab,
  backendStatus,
  backendLatency,
  backendError,
  providers,
  providerDrafts,
  activeProvider,
  settings,
  health,
  savingProviderId,
  verifyingProviderId,
  onClose,
  onTabChange,
  onDraftChange,
  onSaveProvider,
  onVerifyProvider,
  onRefresh,
}: SettingsDialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="settings-scrim" aria-label="Tutup settings" onClick={onClose} />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Settings AI PRD Builder"
            className="settings-dialog"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <aside className="settings-nav">
              <Button type="button" variant="ghost" size="icon" className="settings-close" onClick={onClose}>
                <X className="size-5" />
              </Button>
              <div className="settings-nav-list">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    className={activeTab === tab.id ? 'settings-tab active' : 'settings-tab'}
                    onClick={() => onTabChange(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="settings-content">
              <div className="settings-title-row">
                <div>
                  <p className="stage-eyebrow">Settings</p>
                  <h2>{tabLabel(activeTab)}</h2>
                </div>
                <BackendHealthBadge status={backendStatus} latency={backendLatency} />
              </div>

              {backendError ? <div className="settings-error">{backendError}</div> : null}

              {activeTab === 'general' ? (
                <GeneralPanel activeProvider={activeProvider} backendStatus={backendStatus} />
              ) : null}

              {activeTab === 'ai' ? (
                <AiPanel
                  providers={providers}
                  providerDrafts={providerDrafts}
                  backendStatus={backendStatus}
                  savingProviderId={savingProviderId}
                  verifyingProviderId={verifyingProviderId}
                  onDraftChange={onDraftChange}
                  onSaveProvider={onSaveProvider}
                  onVerifyProvider={onVerifyProvider}
                />
              ) : null}

              {activeTab === 'storage' ? <StoragePanel settings={settings} health={health} /> : null}

              {activeTab === 'notifications' ? <NotificationsPanel settings={settings} /> : null}

              {activeTab === 'apps' ? <ApplicationsPanel settings={settings} /> : null}

              {activeTab === 'system' ? (
                <SystemPanel
                  backendStatus={backendStatus}
                  backendLatency={backendLatency}
                  health={health}
                  onRefresh={onRefresh}
                />
              ) : null}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function BackendHealthBadge({ status, latency }: { status: BackendStatus; latency: number | null }) {
  return (
    <Badge variant="outline" className={status === 'online' ? 'backend-health online' : 'backend-health offline'}>
      {status === 'online' ? <CheckCircle2 className="size-3" /> : <SlidersHorizontal className="size-3" />}
      {status === 'online' ? `API ${latency ?? 0} ms` : status === 'checking' ? 'Checking API' : 'API offline'}
    </Badge>
  )
}

function tabLabel(tab: SettingsTab) {
  return tabs.find((item) => item.id === tab)?.label ?? 'Settings'
}