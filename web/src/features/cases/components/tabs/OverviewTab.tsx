import { Info, Pencil } from 'lucide-react'

import { InfoCard, type InfoItem } from '@/shared/components/InfoCard'
import { formatShortDate } from '@/shared/lib/utils'

import { practiceAreaLabels } from '../../lib/labels'
import type { CaseDetails } from '../../types'
import { DeadlineCard } from '../DeadlineCard'
import { TimelineCard } from '../TimelineCard'

interface OverviewTabProps {
  caseDetails: CaseDetails
  onEditInfo: () => void
}

function buildItems(caseDetails: CaseDetails): InfoItem[] {
  const { milestones } = caseDetails

  return [
    { label: 'Case title', value: caseDetails.title },
    {
      label: 'Practice area',
      value: practiceAreaLabels[caseDetails.practiceArea] ?? caseDetails.practiceArea,
    },
    { label: 'Description', value: caseDetails.description, wide: true },
    { label: 'Court', value: caseDetails.court },
    { label: 'Judge', value: caseDetails.judgeName },
    { label: 'Opposing party', value: caseDetails.opposingParty },
    { label: 'Opposing counsel', value: caseDetails.opposingCounsel },
    {
      label: 'Filing date',
      value: milestones.filingDate ? formatShortDate(milestones.filingDate) : null,
    },
    {
      label: 'Expected closing',
      value: milestones.expectedClosingAt
        ? formatShortDate(milestones.expectedClosingAt)
        : null,
    },
  ]
}

export function OverviewTab({ caseDetails, onEditInfo }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <InfoCard
        title="General Information"
        icon={Info}
        columns={2}
        items={buildItems(caseDetails)}
        action={
          <button
            type="button"
            onClick={onEditInfo}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-blue transition hover:bg-blue-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
          >
            <Pencil className="size-3.5" />
            Edit info
          </button>
        }
      />

      <DeadlineCard deadlines={caseDetails.deadlines} />

      <TimelineCard events={caseDetails.timeline} title="Recent Activity" />
    </div>
  )
}
