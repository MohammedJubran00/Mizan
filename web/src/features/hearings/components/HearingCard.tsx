import {
  CalendarClock,
  Gavel,
  MapPin,
  MoreHorizontal,
  Scale,
  UserRound,
} from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { Card } from '@/shared/components/Card'
import { Checkbox } from '@/shared/components/Checkbox'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { formatShortDate, formatTime } from '@/shared/lib/utils'

import { hearingTypeLabels } from '../lib/labels'
import type { HearingListItem } from '../types'
import { HearingStatusBadge } from './HearingStatusBadge'

interface HearingCardProps {
  item: HearingListItem
  selected: boolean
  onToggleSelect: () => void
  onOpen: () => void
  menuItems: DropdownMenuItem[]
}

export function HearingCard({
  item,
  selected,
  onToggleSelect,
  onOpen,
  menuItems,
}: HearingCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select hearing on ${formatShortDate(item.scheduledAt)}`}
          className="mt-1"
        />

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpen}
            className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/20"
          >
            <p className="font-semibold text-navy">
              {formatShortDate(item.scheduledAt)} · {formatTime(item.scheduledAt)}
            </p>
            <p className="mt-0.5 truncate text-sm text-text-secondary">
              {item.caseRef
                ? `${item.caseRef.caseNumber} — ${item.caseRef.title}`
                : 'Unlinked case'}
            </p>
          </button>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <HearingStatusBadge status={item.status} />
            <Badge variant="neutral">{hearingTypeLabels[item.type]}</Badge>
          </div>

          <dl className="mt-3 space-y-1.5 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <UserRound className="size-3.5 text-text-muted" />
              <dd>{item.client?.fullName ?? 'No client linked'}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-text-muted" />
              <dd>{item.court ?? 'Court TBD'}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Gavel className="size-3.5 text-text-muted" />
              <dd>{item.judgeName ?? 'Judge TBD'}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale className="size-3.5 text-text-muted" />
              <dd>{item.leadLawyer?.fullName ?? 'Unassigned'}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarClock className="size-3.5 text-text-muted" />
              <dd>{hearingTypeLabels[item.type]}</dd>
            </div>
          </dl>
        </div>

        <DropdownMenu
          triggerLabel={`Actions for hearing on ${formatShortDate(item.scheduledAt)}`}
          trigger={<MoreHorizontal className="size-4" />}
          items={menuItems}
        />
      </div>
    </Card>
  )
}
