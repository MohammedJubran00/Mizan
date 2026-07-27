export interface AuthUser {
  id: string
  fullName: string
  email: string
}

export interface AuthWorkspace {
  id: string
  name: string
  role: string
}

export interface LoginResponse {
  success: boolean
  accessToken: string
  user: AuthUser
  workspace: AuthWorkspace
}

export interface RegisterResponse {
  success: boolean
  message: string
}

export interface ApiErrorBody {
  success?: boolean
  message?: string
  error?: string
  errors?: Array<{ field?: string; message?: string }>
}
