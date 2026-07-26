import { Gavel, Mail, MapPin, Scale, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Avatar } from '@/shared/components/Avatar'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { MetricCard } from '@/shared/components/MetricCard'
import { formatRelativeTime, formatShortDate } from '@/shared/lib/utils'

import type { HearingDetails } from '../types'

interface HearingContextCardsProps {
  hearing: HearingDetails
}

export function HearingContextCards({ hearing }: HearingContextCardsProps) {
  const navigate = useNavigate()

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Court
        </p>
        <div className="mt-2 flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-blue" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">
              {hearing.court ?? '—'}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {hearing.courtAddress ?? hearing.room ?? 'Location TBD'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Judge
        </p>
        <div className="mt-2 flex items-start gap-2">
          <Gavel className="mt-0.5 size-4 shrink-0 text-blue" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">
              {hearing.judgeName ?? '—'}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {hearing.judgeTenure ?? 'Tenure unavailable'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Lead lawyer
        </p>
        {hearing.leadLawyer ? (
          <div className="mt-2 flex items-start gap-2">
            <Avatar name={hearing.leadLawyer.fullName} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">
                {hearing.leadLawyer.fullName}
              </p>
              {hearing.leadLawyer.email ? (
                <a
                  href={`mailto:${hearing.leadLawyer.email}`}
                  className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-blue hover:underline"
                >
                  <Mail className="size-3" />
                  {hearing.leadLawyer.email}
                </a>
              ) : (
                <p className="mt-0.5 text-xs text-text-muted">No email on file</p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-muted">Unassigned</p>
        )}
      </Card>

      <MetricCard
        label="Next action"
        value={hearing.nextActionLabel ?? '—'}
        icon={Scale}
        tone={hearing.nextActionDueAt ? 'warning' : 'default'}
        hint={
          hearing.nextActionDueAt
            ? `Due ${formatRelativeTime(hearing.nextActionDueAt)}`
            : hearing.caseRef
              ? undefined
              : 'No follow-up recorded'
        }
        action={
          hearing.caseRef ? (
            <button
              type="button"
              onClick={() => navigate(`/cases/${hearing.caseRef!.id}`)}
              className="rounded px-1 text-[10px] font-bold uppercase tracking-wide text-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
            >
              Case
            </button>
          ) : null
        }
      />
    </div>
  )
}

interface HearingPeopleSidebarProps {
  hearing: HearingDetails
}

export function HearingPeopleSidebar({ hearing }: HearingPeopleSidebarProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Post-hearing plan
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Next hearing date
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          {hearing.nextHearingAt
            ? formatShortDate(hearing.nextHearingAt)
            : 'To be determined by judge'}
        </p>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Pending actions
        </p>
        {hearing.pendingActions.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No pending actions yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {hearing.pendingActions.map((action) => (
              <li key={action.id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={action.completed}
                  readOnly
                  className="mt-0.5 size-4 accent-navy"
                  aria-label={action.label}
                />
                <span
                  className={
                    action.completed
                      ? 'text-text-muted line-through'
                      : 'text-text-secondary'
                  }
                >
                  {action.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {hearing.client ? (
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Client
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Avatar name={hearing.client.fullName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">
                {hearing.client.fullName}
              </p>
              {hearing.client.subtitle ? (
                <p className="truncate text-xs text-text-muted">
                  {hearing.client.subtitle}
                </p>
              ) : null}
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => navigate(`/clients/${hearing.client!.id}`)}
          >
            <UserRound className="size-4" />
            View client
          </Button>
        </Card>
      ) : null}
    </div>
  )
}
