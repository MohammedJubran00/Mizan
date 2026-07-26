import { ClipboardCheck, Info, Pencil } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { InfoCard, type InfoItem } from '@/shared/components/InfoCard'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatDateTime, formatShortDate } from '@/shared/lib/utils'

import { formatDuration, hearingOutcomeLabels, hearingTypeLabels } from '../../lib/labels'
import type { HearingDetails } from '../../types'
import { HearingPeopleSidebar } from '../HearingContextCards'

interface OverviewTabProps {
  hearing: HearingDetails
  onEdit: () => void
  onRecordOutcome: () => void
}

export function OverviewTab({
  hearing,
  onEdit,
  onRecordOutcome,
}: OverviewTabProps) {
  const items: InfoItem[] = [
    { label: 'Hearing type', value: hearingTypeLabels[hearing.type] },
    {
      label: 'Date & time',
      value: formatDateTime(hearing.scheduledAt),
    },
    {
      label: 'Courtroom',
      value: hearing.room
        ? `${hearing.room}${hearing.court ? ` · ${hearing.court}` : ''}`
        : hearing.court,
    },
    {
      label: 'Expected duration',
      value: formatDuration(hearing.durationMinutes),
    },
    {
      label: 'Hearing summary',
      value: hearing.summary ?? hearing.notes,
      wide: true,
    },
  ]

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <InfoCard
          title="General Information"
          icon={Info}
          columns={2}
          items={items}
          action={
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-blue transition hover:bg-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          }
        />

        <SectionCard title="Outcome / Results" icon={ClipboardCheck}>
          {hearing.outcome ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-navy">
                {hearingOutcomeLabels[hearing.outcome.result]}
              </p>
              {hearing.outcome.judgeDecision ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {hearing.outcome.judgeDecision}
                </p>
              ) : null}
              {hearing.outcome.summary ? (
                <p className="text-sm text-text-secondary">
                  <span className="font-semibold text-navy">Summary: </span>
                  {hearing.outcome.summary}
                </p>
              ) : null}
              <p className="text-xs text-text-muted">
                Recorded {formatShortDate(hearing.outcome.recordedAt)}
              </p>
              <Button size="sm" variant="secondary" onClick={onRecordOutcome}>
                Update outcome
              </Button>
            </div>
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No outcome recorded"
              description="Once this hearing concludes, record the result, judge decision, and next actions here."
              className="border-0 py-8"
              action={
                <Button
                  onClick={onRecordOutcome}
                  disabled={
                    hearing.status === 'UPCOMING' || hearing.status === 'SCHEDULED'
                  }
                >
                  Record Outcome
                </Button>
              }
            />
          )}
        </SectionCard>
      </div>

      <HearingPeopleSidebar hearing={hearing} />
    </div>
  )
}
