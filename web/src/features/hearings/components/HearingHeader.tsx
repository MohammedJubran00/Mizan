import {
  CalendarClock,
  ClipboardCheck,
  MoreHorizontal,
  Pencil,
  Printer,
  Share2,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { formatShortDate, formatTime } from '@/shared/lib/utils'

import { hearingTypeLabels } from '../lib/labels'
import type { HearingDetails } from '../types'
import { HearingStatusBadge } from './HearingStatusBadge'

interface HearingHeaderProps {
  hearing: HearingDetails
  onEdit: () => void
  onShare: () => void
  onPrint: () => void
  onReschedule: () => void
  onUpdateOutcome: () => void
  onDelete: () => void
}

export function HearingHeader({
  hearing,
  onEdit,
  onShare,
  onPrint,
  onReschedule,
  onUpdateOutcome,
  onDelete,
}: HearingHeaderProps) {
  const menuItems: DropdownMenuItem[] = [
    {
      id: 'reschedule',
      label: 'Reschedule',
      icon: CalendarClock,
      onSelect: onReschedule,
    },
    {
      id: 'outcome',
      label: 'Update outcome',
      icon: ClipboardCheck,
      onSelect: onUpdateOutcome,
    },
    { id: 'print', label: 'Print', icon: Printer, onSelect: onPrint },
    {
      id: 'delete',
      label: 'Delete hearing',
      icon: Trash2,
      tone: 'danger',
      onSelect: onDelete,
    },
  ]

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl text-navy sm:text-3xl">
              {hearingTypeLabels[hearing.type]}
            </h2>
            {hearing.caseRef ? (
              <Badge variant="neutral">{hearing.caseRef.caseNumber}</Badge>
            ) : null}
            <HearingStatusBadge status={hearing.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-secondary">
            <span>
              {formatShortDate(hearing.scheduledAt)} · {formatTime(hearing.scheduledAt)}
            </span>
            {hearing.caseRef ? <span>{hearing.caseRef.title}</span> : null}
            {hearing.client ? <span>{hearing.client.fullName}</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onShare}>
            <Share2 className="size-4" />
            Share
          </Button>
          <Button size="sm" onClick={onEdit}>
            <Pencil className="size-4" />
            Edit Hearing
          </Button>
          <DropdownMenu
            triggerLabel="More hearing actions"
            trigger={<MoreHorizontal className="size-4" />}
            items={menuItems}
          />
        </div>
      </div>
    </Card>
  )
}
