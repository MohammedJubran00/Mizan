import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AuthUser, AuthWorkspace } from '@/shared/types/auth'

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  workspace: AuthWorkspace | null
  setSession: (payload: {
    accessToken: string
    user: AuthUser
    workspace: AuthWorkspace
  }) => void
  clearSession: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      workspace: null,
      setSession: ({ accessToken, user, workspace }) =>
        set({ accessToken, user, workspace }),
      clearSession: () =>
        set({ accessToken: null, user: null, workspace: null }),
      isAuthenticated: () => Boolean(get().accessToken),
    }),
    {
      name: 'mizan-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        workspace: state.workspace,
      }),
    },
  ),
)
