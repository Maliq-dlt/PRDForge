import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../use-app-store'

describe('useAppStore', () => {
  beforeEach(() => {
    localStorage.clear()
    const { logoutUser } = useAppStore.getState()
    logoutUser()
  })

  it('memiliki state awal default', () => {
    const state = useAppStore.getState()
    expect(state.sidebarOpen).toBe(false)
    expect(state.settingsOpen).toBe(false)
    expect(state.stage).toBe('intake')
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('dapat mengubah sidebarOpen', () => {
    const { setSidebarOpen } = useAppStore.getState()
    setSidebarOpen(true)
    expect(useAppStore.getState().sidebarOpen).toBe(true)
  })

  it('dapat menyimpan sesi login user', () => {
    const { loginUser } = useAppStore.getState()
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: '2026-07-09T00:00:00Z',
      updated_at: '2026-07-09T00:00:00Z',
    }
    const mockToken = 'mock-token'

    loginUser(mockToken, mockUser)

    const state = useAppStore.getState()
    expect(state.token).toBe(mockToken)
    expect(state.user).toEqual(mockUser)
    expect(state.isAuthenticated).toBe(true)
    expect(localStorage.getItem('token')).toBe(mockToken)
    expect(localStorage.getItem('user')).toContain('john@example.com')
  })

  it('dapat menghapus sesi logout user', () => {
    const { loginUser, logoutUser } = useAppStore.getState()
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: '2026-07-09T00:00:00Z',
      updated_at: '2026-07-09T00:00:00Z',
    }
    
    loginUser('mock-token', mockUser)
    expect(useAppStore.getState().isAuthenticated).toBe(true)

    logoutUser()

    const state = useAppStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('dapat logout otomatis jika menerima event api-unauthorized', () => {
    const { loginUser } = useAppStore.getState()
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: '2026-07-09T00:00:00Z',
      updated_at: '2026-07-09T00:00:00Z',
    }

    loginUser('mock-token', mockUser)
    expect(useAppStore.getState().isAuthenticated).toBe(true)

    // Dispatch event
    window.dispatchEvent(new CustomEvent('api-unauthorized'))

    const state = useAppStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
