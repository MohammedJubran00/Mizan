import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CaseFormValues } from '@/features/cases/lib/caseForm'

interface CaseDraftState {
  draft: CaseFormValues | null
  savedAt: string | null
  saveDraft: (values: CaseFormValues) => void
  clearDraft: () => void
}

/**
 * "Save draft" keeps an unfinished intake form in local storage so it survives a
 * reload. It moves to the API once `POST /api/cases/drafts` exists.
 */
export const useCaseDraftStore = create<CaseDraftState>()(
  persist(
    (set) => ({
      draft: null,
      savedAt: null,
      saveDraft: (values) =>
        set({ draft: values, savedAt: new Date().toISOString() }),
      clearDraft: () => set({ draft: null, savedAt: null }),
    }),
    { name: 'mizan-case-draft' },
  ),
)
