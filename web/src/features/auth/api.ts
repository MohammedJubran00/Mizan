import { apiClient, getErrorMessage } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { LoginResponse, RegisterResponse } from '@/shared/types/auth'

export async function login(email: string, password: string) {
  try {
    const { data } = await apiClient.post<LoginResponse>(endpoints.auth.login, {
      email,
      password,
    })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to log in.'))
  }
}

export async function register(payload: {
  fullName: string
  email: string
  password: string
}) {
  try {
    const { data } = await apiClient.post<RegisterResponse>(
      endpoints.auth.register,
      payload,
    )
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to create account.'))
  }
}
