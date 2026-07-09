import type { ReactNode } from 'react'
import {
  Cloud,
  Database,
  Globe2,
  Loader2,
  RefreshCcw,
  Save,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiBaseUrl, type ApiProvider, type BootstrapViewModel, type HealthSnapshot } from '@/lib/api'
import type { BackendStatus, ProviderDraft } from '@/lib/app-types'

export function GeneralPanel({ activeProvider, backendStatus }: { activeProvider: ApiProvider | null; backendStatus: BackendStatus }) {
  return (
    <div className="settings-panel">
      <SettingsBlock title="Workspace">
        <SettingsLine label="Mode tampilan" value="Dark interface" />
        <SettingsLine label="Bahasa" value="Indonesia" />
        <SettingsLine label="Backend" value={backendStatus === 'online' ? 'Connected' : 'Offline'} />
        <SettingsLine label="AI aktif" value={activeProvider?.name ?? 'Belum ada provider'} />
      </SettingsBlock>
      <SettingsBlock title="PRD flow">
        <SettingsLine label="Input utama" value="Chat ide produk" />
        <SettingsLine label="Stack mode" value="AI, manual, atau hybrid" />
        <SettingsLine label="Diagram" value="Mermaid flowchart, ERD, use case" />
      </SettingsBlock>
    </div>
  )
}

export function AiPanel({
  providers,
  providerDrafts,
  backendStatus,
  savingProviderId,
  verifyingProviderId,
  onDraftChange,
  onSaveProvider,
  onVerifyProvider,
}: {
  providers: ApiProvider[]
  providerDrafts: Record<number, ProviderDraft>
  backendStatus: BackendStatus
  savingProviderId: number | null
  verifyingProviderId: number | null
  onDraftChange: (providerId: number, field: keyof ProviderDraft, value: string) => void
  onSaveProvider: (provider: ApiProvider) => void
  onVerifyProvider: (provider: ApiProvider) => void
}) {
  return (
    <div className="settings-panel provider-settings-grid">
      {providers.map((provider) => {
        const draft = providerDrafts[provider.id] ?? draftFromProvider(provider)
        const canMutate = backendStatus === 'online' && provider.id > 0
        const saving = savingProviderId === provider.id
        const verifying = verifyingProviderId === provider.id

        return (
          <section key={provider.id} className="provider-row">
            <div className="provider-row-head">
              <div>
                <div className="provider-name-row">
                  <StatusDot status={provider.status} />
                  <h3>{provider.name}</h3>
                </div>
                <p>{provider.provider} / {provider.authType}</p>
              </div>
              <Badge variant="outline" className={`provider-status ${provider.status}`}>
                {providerStatusLabel(provider.status)}
              </Badge>
            </div>

            <div className="provider-form-grid">
              <label>
                <span>Model</span>
                <Input
                  value={draft.model}
                  disabled={!canMutate}
                  onChange={(event) => onDraftChange(provider.id, 'model', event.target.value)}
                  placeholder="gpt-4.1-mini"
                />
              </label>
              <label>
                <span>Endpoint cloud / lokal</span>
                <Input
                  value={draft.endpointUrl}
                  disabled={!canMutate}
                  onChange={(event) => onDraftChange(provider.id, 'endpointUrl', event.target.value)}
                  placeholder="https://api.openai.com/v1 atau http://127.0.0.1:11434/v1"
                />
              </label>
              <label>
                <span>API key</span>
                <Input
                  type="password"
                  value={draft.apiKey}
                  disabled={!canMutate}
                  onChange={(event) => onDraftChange(provider.id, 'apiKey', event.target.value)}
                  placeholder={provider.apiKeyConfigured ? 'Key tersimpan, isi untuk mengganti' : 'Masukkan API key'}
                />
              </label>
              <label>
                <span>Batas kuota token</span>
                <Input
                  type="number"
                  min="0"
                  value={draft.quotaLimit}
                  disabled={!canMutate}
                  onChange={(event) => onDraftChange(provider.id, 'quotaLimit', event.target.value)}
                  placeholder="1000000"
                />
              </label>
            </div>

            <QuotaMeter provider={provider} />

            <div className="provider-actions">
              <small>{provider.lastVerifiedAt ? `Terakhir dicek ${formatDate(provider.lastVerifiedAt)}` : 'Belum pernah dicek'}</small>
              <div>
                <Button type="button" variant="secondary" disabled={!canMutate || saving} onClick={() => onSaveProvider(provider)}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Simpan
                </Button>
                <Button type="button" disabled={!canMutate || verifying} onClick={() => onVerifyProvider(provider)}>
                  {verifying ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                  Verifikasi
                </Button>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function StoragePanel({ settings, health }: { settings: BootstrapViewModel['settings'] | null; health: HealthSnapshot | null }) {
  return (
    <div className="settings-panel">
      <SettingsBlock title="Database">
        <SettingsLine label="Driver" value={readSetting(settings?.storage, 'driver', health?.database.driver ?? 'unknown')} />
        <SettingsLine label="Connection" value={health?.database.connection ?? 'offline'} />
        <SettingsLine label="File database" value={readSetting(settings?.storage, 'database', 'backend belum aktif')} />
        <SettingsLine label="Retensi project" value={readSetting(settings?.storage, 'projectRetention', 'local')} />
      </SettingsBlock>
      <SettingsBlock title="Records">
        <SettingsLine label="Provider AI" value={formatNumber(health?.records.providers ?? 0)} />
        <SettingsLine label="Project" value={formatNumber(health?.records.projects ?? 0)} />
        <SettingsLine label="History message" value={formatNumber(health?.records.messages ?? 0)} />
      </SettingsBlock>
    </div>
  )
}

export function NotificationsPanel({ settings }: { settings: BootstrapViewModel['settings'] | null }) {
  return (
    <div className="settings-panel">
      <SettingsBlock title="Peringatan">
        <FeatureLine label="Quota warning" enabled={Boolean(settings?.notifications.quotaWarnings)} />
        <FeatureLine label="Provider gagal diverifikasi" enabled={Boolean(settings?.notifications.failedVerification)} />
        <FeatureLine label="Export PRD selesai" enabled={Boolean(settings?.notifications.exportReady)} />
      </SettingsBlock>
    </div>
  )
}

export function ApplicationsPanel({ settings }: { settings: BootstrapViewModel['settings'] | null }) {
  return (
    <div className="settings-panel">
      <SettingsBlock title="Tool aktif">
        <FeatureLine label="Mermaid diagram" enabled={Boolean(settings?.applications.mermaid)} />
        <FeatureLine label="Markdown export" enabled={Boolean(settings?.applications.markdownExport)} />
        <FeatureLine label="PDF export" enabled={Boolean(settings?.applications.pdfExport)} />
        <FeatureLine label="GitHub export" enabled={Boolean(settings?.applications.githubExport)} />
      </SettingsBlock>
    </div>
  )
}

export function SystemPanel({
  backendStatus,
  backendLatency,
  health,
  onRefresh,
}: {
  backendStatus: BackendStatus
  backendLatency: number | null
  health: HealthSnapshot | null
  onRefresh: () => void
}) {
  const dbOk = Boolean(health?.database.ok)
  const verifiedProviders = health?.records.verifiedProviders ?? 0

  return (
    <div className="settings-panel">
      <div className="system-toolbar">
        <div>
          <p>Endpoint</p>
          <strong>{apiBaseUrl()}</strong>
        </div>
        <Button type="button" variant="secondary" onClick={onRefresh}>
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="system-check-grid">
        <HealthTile icon={<Globe2 className="size-5" />} label="Frontend" value="React aktif" detail="Vite client loaded" ok />
        <HealthTile
          icon={<Server className="size-5" />}
          label="API"
          value={backendStatus === 'online' ? 'Online' : 'Offline'}
          detail={backendLatency ? `${backendLatency} ms latency` : 'Menunggu response'}
          ok={backendStatus === 'online'}
        />
        <HealthTile
          icon={<Database className="size-5" />}
          label="Database"
          value={dbOk ? 'Connected' : 'Unavailable'}
          detail={health?.database.driver ?? health?.database.error ?? 'No snapshot'}
          ok={dbOk}
        />
        <HealthTile
          icon={<Cloud className="size-5" />}
          label="Verified AI"
          value={`${verifiedProviders} provider`}
          detail="Provider dengan credential valid"
          ok={verifiedProviders > 0}
        />
      </div>

      {health ? (
        <SettingsBlock title="Contract API">
          {Object.entries(health.frontendContract).map(([key, value]) => (
            <SettingsLine key={key} label={key} value={value} />
          ))}
        </SettingsBlock>
      ) : null}
    </div>
  )
}

export function SettingsBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-block">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  )
}

export function SettingsLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="settings-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function FeatureLine({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="settings-line feature-line">
      <span>{label}</span>
      <Badge variant="outline" className={enabled ? 'feature-enabled' : 'feature-disabled'}>
        {enabled ? 'Aktif' : 'Nonaktif'}
      </Badge>
    </div>
  )
}

export function HealthTile({ icon, label, value, detail, ok }: { icon: ReactNode; label: string; value: string; detail: string; ok: boolean }) {
  return (
    <div className={ok ? 'health-tile ok' : 'health-tile warn'}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </div>
  )
}

export function QuotaMeter({ provider }: { provider: ApiProvider }) {
  const limit = provider.quota.limit
  const used = provider.quota.used ?? 0
  const remaining = provider.quota.remaining
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0

  return (
    <div className="quota-meter">
      <div>
        <span>Kuota</span>
        <strong>{limit ? `${formatNumber(remaining ?? 0)} tersisa` : 'Lokal / tidak dibatasi'}</strong>
      </div>
      <div className="quota-track" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
      <small>{limit ? `${formatNumber(used)} dipakai dari ${formatNumber(limit)}` : 'Tidak memakai quota cloud'}</small>
    </div>
  )
}

export function StatusDot({ status }: { status: string }) {
  return <span className={`provider-status-dot ${status}`} aria-hidden="true" />
}

export function providerStatusLabel(status: string) {
  if (status === 'verified') return 'Terverifikasi'
  if (status === 'error') return 'Error'
  return 'Belum verified'
}

export function draftFromProvider(provider: ApiProvider): ProviderDraft {
  return {
    model: provider.model ?? '',
    endpointUrl: provider.endpointUrl ?? '',
    apiKey: '',
    quotaLimit: provider.quota.limit === null ? '' : String(provider.quota.limit),
  }
}

function readSetting(group: Record<string, unknown> | undefined, key: string, fallback: string) {
  const value = group?.[key]
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'aktif' : 'nonaktif'
  return fallback
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}
