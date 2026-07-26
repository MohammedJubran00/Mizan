export const endpoints = {
  health: '/health',
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
  },
  dashboard: '/api/dashboard',
  documents: {
    root: '/api/documents',
    byId: (id: string) => `/api/documents/${id}`,
    file: (id: string) => `/api/documents/${id}/file`,
  },
} as const
