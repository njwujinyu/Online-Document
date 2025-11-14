/*
版权声明 (c) 2025 Edi. 保留所有权利。
所有讨论与反馈请使用本仓库 Issues。
*/
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, User } from '@/types'
import { postLogin, getSession, postLogout } from '@/utils/api'

interface AuthActions {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const res = await postLogin(username, password)
          if (res.ok) {
            const s = await getSession()
            if (s.authenticated) {
              const user: User = { id: '1', username, createdAt: new Date() }
              set({ isAuthenticated: true, user, isLoading: false })
              return true
            }
          }
          set({ error: '用户名或密码错误', isLoading: false })
          return false
        } catch {
          set({ error: '登录失败，请重试', isLoading: false })
          return false
        }
      },

      logout: async () => {
        await postLogout()
        set({ isAuthenticated: false, user: null, error: null })
      },

      clearError: () => {
        set({ error: null })
      },
      init: async () => {
        try {
          const s = await getSession()
          if (s.authenticated) {
            set({ isAuthenticated: true })
          } else {
            set({ isAuthenticated: false, user: null })
          }
        } catch {
          set({ isAuthenticated: false, user: null })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
)
