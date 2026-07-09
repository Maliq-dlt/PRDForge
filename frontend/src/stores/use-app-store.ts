import { create } from 'zustand'
import type { FlowStage } from '@/components/workspace'

interface UserProfile {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

interface AppState {
  sidebarOpen: boolean
  settingsOpen: boolean
  stage: FlowStage
  token: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  setSidebarOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setStage: (stage: FlowStage) => void
  loginUser: (token: string, user: UserProfile) => void
  logoutUser: () => void
}

export const useAppStore = create<AppState>((set) => {
  const token = localStorage.getItem('token')
  let user: UserProfile | null = null

  try {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      user = JSON.parse(savedUser)
    }
  } catch (e) {
    console.error('Gagal memuat profil pengguna dari localStorage', e)
  }

  return {
    sidebarOpen: false,
    settingsOpen: false,
    stage: 'intake',
    token,
    user,
    isAuthenticated: !!token,

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setSettingsOpen: (open) => set({ settingsOpen: open }),
    setStage: (stage) => set({ stage }),

    loginUser: (token, user) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token, user, isAuthenticated: true })
    },

    logoutUser: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ token: null, user: null, isAuthenticated: false, sidebarOpen: false, settingsOpen: false })
    },
  }
})

if (typeof window !== 'undefined') {
  window.addEventListener('api-unauthorized', () => {
    useAppStore.getState().logoutUser()
  })
}

