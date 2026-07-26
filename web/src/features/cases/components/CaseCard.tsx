import { CalendarClock, MoreHorizontal, Scale, UserRound } from 'lucide-react'

import { Card } from '@/shared/components/Card'
import { Checkbox } from '@/shared/components/Checkbox'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { formatShortDate } from '@/shared/lib/utils'

import { practiceAreaLabels } from '../lib/labels'
import type { CaseListItem } from '../types'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'

interface CaseCardProps {
  item: CaseListItem
  selected: boolean
  onToggleSelect: () => void
  onOpen: () => void
  menuItems: DropdownMenuItem[]
}

/** Compact representation of a case row, used instead of the table on small screens. */
export function CaseCard({
  item,
  selected,
  onToggleSelect,
  onOpen,
  menuItems,
}: CaseCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select case ${item.caseNumber}`}
          className="mt-1"
        />

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpen}
            className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
          >
            <p className="font-mono text-xs text-blue">{item.caseNumber}</p>
            <p className="mt-0.5 truncate font-semibold text-navy">{item.title}</p>
          </button>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            <PriorityBadge priority={item.priority} />
          </div>

          <dl className="mt-3 space-y-1.5 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Client</dt>
              <UserRound className="size-3.5 text-text-muted" />
              <dd>{item.client?.fullName ?? 'No client linked'}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Practice area</dt>
              <Scale className="size-3.5 text-text-muted" />
              <dd>{practiceAreaLabels[item.practiceArea]}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Next hearing</dt>
              <CalendarClock className="size-3.5 text-text-muted" />
              <dd>
                {item.nextHearingAt
                  ? formatShortDate(item.nextHearingAt)
                  : 'No hearing scheduled'}
              </dd>
            </div>
          </dl>
        </div>

        <DropdownMenu
          triggerLabel={`Actions for ${item.caseNumber}`}
          trigger={<MoreHorizontal className="size-4" />}
          items={menuItems}
        />
      </div>
    </Card>
  )
}
