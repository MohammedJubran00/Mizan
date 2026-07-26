import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Scale, ShieldCheck, Timer } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/lib/utils'

const slides = [
  {
    id: 'welcome',
    eyebrow: 'Welcome',
    title: 'Practice management, refined for counsel.',
    body: 'Mizan brings your matters, deadlines, and firm activity into one calm workspace built for legal professionals.',
    icon: Scale,
  },
  {
    id: 'efficiency',
    eyebrow: 'Efficiency',
    title: 'See what needs attention—before it becomes urgent.',
    body: 'Track hearings, deadlines, and revenue signals in a single overview so your team stays ahead of the docket.',
    icon: Timer,
  },
  {
    id: 'security',
    eyebrow: 'Trust',
    title: 'Built for confidentiality and firm-grade access.',
    body: 'Workspace-scoped data and role-aware membership keep sensitive practice information where it belongs.',
    icon: ShieldCheck,
  },
]

export function OnboardingPage() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const Icon = slide.icon
  const isLast = index === slides.length - 1

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy-deep text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 15% 20%, rgba(47,91,234,0.35), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(212,175,55,0.22), transparent 55%)',
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight">
              Mizan
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-light">
              Legal
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            Skip
          </button>
        </header>

        <main className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
              {slide.eyebrow}
            </p>
            <h1 className="font-display max-w-xl text-4xl leading-tight font-semibold sm:text-5xl">
              {slide.title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
              {slide.body}
            </p>

            <div className="mt-10 flex items-center gap-3">
              {slides.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === index ? 'w-10 bg-gold' : 'w-3 bg-white/25 hover:bg-white/40',
                  )}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {!isLast ? (
                <Button
                  size="lg"
                  className="bg-gold text-navy-deep hover:bg-gold-light focus-visible:ring-gold/40"
                  onClick={() => setIndex((value) => value + 1)}
                >
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="bg-gold text-navy-deep hover:bg-gold-light focus-visible:ring-gold/40"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                  <ArrowRight className="size-4" />
                </Button>
              )}
              <Link
                to="/login"
                className="inline-flex h-12 items-center px-4 text-sm font-semibold text-white/80 transition hover:text-white"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 backdrop-blur-sm">
              <div className="absolute -right-10 -top-10 size-40 rounded-full bg-gold/20 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 size-36 rounded-full bg-blue/30 blur-3xl" />
              <div className="relative flex aspect-square flex-col justify-between">
                <Icon className="size-14 text-gold-light" strokeWidth={1.5} />
                <div>
                  <p className="font-display text-3xl text-white">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-2 text-sm text-white/55">
                    of {String(slides.length).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
