export type BackendStatus = 'checking' | 'online' | 'offline'

export type SettingsTab = 'general' | 'ai' | 'storage' | 'notifications' | 'apps' | 'system'

export type ProviderDraft = {
  model: string
  endpointUrl: string
  apiKey: string
  quotaLimit: string
}