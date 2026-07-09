export type ApiQuota = {
  limit: number | null
  used: number
  remaining: number | null
  resetAt: string | null
}

export type ApiProvider = {
  id: number
  name: string
  provider: string
  authType: string
  model: string | null
  endpointUrl: string | null
  status: 'verified' | 'unverified' | 'error' | string
  apiKeyConfigured: boolean
  quota: ApiQuota
  lastVerifiedAt: string | null
  metadata: Record<string, unknown>
  updatedAt: string | null
}

export type ApiProject = {
  id: number
  name: string
  status: string
  currentStage: string
  summary: string | null
  stackDecision: Record<string, string>
  metadata: Record<string, unknown>
  messageCount?: number
  updatedAt: string | null
}

export type HealthSnapshot = {
  status: 'ok' | 'degraded' | string
  checkedAt: string
  app: {
    name: string
    environment: string
    debug: boolean
  }
  database: {
    ok: boolean
    connection: string
    driver?: string
    error?: string
  }
  records: {
    providers: number
    verifiedProviders: number
    projects: number
    messages: number
  }
  frontendContract: Record<string, string>
}

export type SettingsBootstrap = {
  health: HealthSnapshot
  ai: {
    activeProvider: ApiProvider | null
    providers: ApiProvider[] | { data: ApiProvider[] }
    providerOptions: Array<{ id: string; label: string; authType: string }>
  }
  projects: ApiProject[] | { data: ApiProject[] }
  settings: {
    storage: Record<string, unknown>
    notifications: Record<string, unknown>
    applications: Record<string, unknown>
  }
}

export type ConversationHistoryItem = {
  id: number
  project: {
    id: number | null
    name: string | null
  }
  role: string
  content: string
  createdAt: string | null
}

export type BootstrapViewModel = {
  health: HealthSnapshot | null
  providers: ApiProvider[]
  projects: ApiProject[]
  history: ConversationHistoryItem[]
  settings: SettingsBootstrap['settings'] | null
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  errors: Record<string, string[]>
  constructor(status: number, message: string, errors: Record<string, string[]>) {
    super(status, message)
    this.errors = errors
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(status: number, message: string) {
    super(status, message)
    this.name = 'AuthenticationError'
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'

function unwrapData<T>(value: T[] | { data: T[] } | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : value.data
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let errorData: any = null
    try {
      errorData = await response.json()
    } catch {
      // not JSON
    }

    const message = errorData?.message || `Request failed with status ${response.status}`

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-unauthorized'))
      }
      throw new AuthenticationError(response.status, message)
    }

    if (response.status === 422 && errorData?.errors) {
      throw new ValidationError(response.status, message, errorData.errors)
    }

    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}

export async function loadBootstrap(): Promise<BootstrapViewModel> {
  const [bootstrap, history] = await Promise.all([
    request<SettingsBootstrap>('/settings/bootstrap'),
    request<{ data: ConversationHistoryItem[] }>('/conversation-history'),
  ])

  return {
    health: bootstrap.health,
    providers: unwrapData(bootstrap.ai.providers),
    projects: unwrapData(bootstrap.projects),
    history: history.data,
    settings: bootstrap.settings,
  }
}

export async function loadHealth(): Promise<HealthSnapshot> {
  return request<HealthSnapshot>('/health')
}

export async function updateProvider(
  id: number,
  payload: {
    name?: string
    provider?: string
    authType?: string
    model?: string
    endpointUrl?: string
    apiKey?: string
    quotaLimit?: number | null
  },
): Promise<ApiProvider> {
  const response = await request<{ data?: ApiProvider } | ApiProvider>(`/ai-providers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  if (response && typeof response === 'object') {
    if ('data' in response && response.data) {
      return response.data
    }
    return response as ApiProvider
  }

  throw new Error('Respons API tidak valid')
}

export async function verifyProvider(id: number): Promise<ApiProvider> {
  const response = await request<{ provider?: { data?: ApiProvider } | ApiProvider }>(`/ai-providers/${id}/verify`, {
    method: 'POST',
  })

  if (response && typeof response === 'object' && 'provider' in response && response.provider) {
    const provider = response.provider
    if (provider && typeof provider === 'object') {
      if ('data' in provider && provider.data) {
        return provider.data
      }
      return provider as ApiProvider
    }
  }

  throw new Error('Respons API tidak valid')
}

export function apiBaseUrl() {
  return API_BASE_URL
}