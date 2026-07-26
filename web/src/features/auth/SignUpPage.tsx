import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { register } from '@/features/auth/api'
import { AuthLayout } from '@/shared/components/AuthLayout'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'

export function SignUpPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validate() {
    const next: Record<string, string> = {}
    if (!fullName.trim()) next.fullName = 'Full name is required.'
    if (!email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Please enter a valid email.'
    }
    if (!password) next.password = 'Password is required.'
    else if (password.length < 8) {
      next.password = 'Password must be at least 8 characters.'
    }
    if (password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match.'
    }
    if (!agreed) {
      next.agreed = 'Please agree to the Terms of Service and Privacy Policy.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSuccess(null)
    if (!validate()) return

    setLoading(true)
    try {
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      })
      setSuccess(result.message || 'Account created. Please log in.')
      setTimeout(() => navigate('/login', { replace: true }), 900)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to create account.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-navy sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Join Mizan and manage your legal practice efficiently.
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
        {success ? (
          <div
            role="status"
            className="rounded-lg border border-success/20 bg-success/5 px-3.5 py-3 text-sm text-success"
          >
            {success}
          </div>
        ) : null}

        <Input
          label="Full Name"
          name="fullName"
          autoComplete="name"
          placeholder="Johnathan Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />
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
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <label className="flex items-start gap-3 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 size-4 rounded border-border accent-navy"
          />
          <span>
            I agree to the{' '}
            <span className="font-medium text-navy">Terms of Service</span> and{' '}
            <span className="font-medium text-navy">Privacy Policy</span>.
          </span>
        </label>
        {errors.agreed ? (
          <span className="-mt-2 text-xs text-danger">{errors.agreed}</span>
        ) : null}

        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue hover:underline">
          Log In
        </Link>
      </p>
    </AuthLayout>
  )
}
