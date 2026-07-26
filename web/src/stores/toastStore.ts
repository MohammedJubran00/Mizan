import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastState {
  toasts: ToastMessage[]
  push: (toast: Omit<ToastMessage, 'id'> & { duration?: number }) => string
  dismiss: (id: string) => void
}

const DEFAULT_DURATION = 4500

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: ({ duration = DEFAULT_DURATION, ...toast }) => {
    const id =
      globalThis.crypto?.randomUUID?.() ?? `toast-${Date.now()}-${Math.random()}`

    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))

    if (duration > 0) {
      window.setTimeout(() => get().dismiss(id), duration)
    }

    return id
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}))

/** Imperative helpers so services and mutations can notify without hooks. */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'error' }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ title, description, variant: 'info' }),
}
