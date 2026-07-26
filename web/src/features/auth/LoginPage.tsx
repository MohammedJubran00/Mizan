import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { login } from '@/features/auth/api'
import { AuthLayout } from '@/shared/components/AuthLayout'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Please enter a valid email.'
    }
    if (!password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setLoading(true)
    try {
      const result = await login(email.trim(), password)
      setSession({
        accessToken: result.accessToken,
        user: result.user,
        workspace: result.workspace,
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to log in.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-navy sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Log in to manage your legal practice.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {formError ? (
          <div
            role="alert"
            className="rounded-lg border border-danger/20 bg-danger/5 px-3.5 py-3 text-sm text-danger"
          >
            {formError}
          </div>
        ) : null}

        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="attorney@mizan.law"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <button
            type="button"
            className="mt-2 text-sm font-medium text-blue hover:underline"
            onClick={() =>
              setFormError('Password recovery is coming soon.')
            }
          >
            Forgot Password?
          </button>
        </div>

        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Login
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-semibold text-blue hover:underline">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  )
}
