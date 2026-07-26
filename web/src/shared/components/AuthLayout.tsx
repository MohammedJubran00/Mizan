import { Link } from 'react-router-dom'

import { cn } from '@/shared/lib/utils'

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 0% 0%, rgba(47,91,234,0.08), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(212,175,55,0.12), transparent 50%)',
        }}
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-10 sm:px-8">
        <Link to="/" className="mb-10 inline-flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold tracking-tight text-navy">
            Mizan
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
            Legal
          </span>
        </Link>
        <div className={cn('flex flex-1 flex-col', className)}>{children}</div>
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-6 text-xs text-text-muted">
          <span>© {new Date().getFullYear()} Mizan Legal Tech</span>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
