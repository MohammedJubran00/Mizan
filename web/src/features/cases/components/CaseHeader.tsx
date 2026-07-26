import {
  CalendarPlus,
  Gavel,
  MoreHorizontal,
  Pencil,
  Printer,
  RefreshCcw,
  Scale,
  Share2,
  Trash2,
  UserRound,
} from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'

import { practiceAreaLabels } from '../lib/labels'
import type { CaseDetails } from '../types'
import { PriorityBadge } from './PriorityBadge'
import { StatusBadge } from './StatusBadge'

interface CaseHeaderProps {
  caseDetails: CaseDetails
  onEdit: () => void
  onChangeStatus: () => void
  onShare: () => void
  onPrint: () => void
  onScheduleHearing: () => void
  onDelete: () => void
}

export function CaseHeader({
  caseDetails,
  onEdit,
  onChangeStatus,
  onShare,
  onPrint,
  onScheduleHearing,
  onDelete,
}: CaseHeaderProps) {
  const menuItems: DropdownMenuItem[] = [
    {
      id: 'status',
      label: 'Change status',
      icon: RefreshCcw,
      onSelect: onChangeStatus,
    },
    {
      id: 'hearing',
      label: 'Schedule hearing',
      icon: CalendarPlus,
      onSelect: onScheduleHearing,
    },
    { id: 'print', label: 'Print docket', icon: Printer, onSelect: onPrint },
    {
      id: 'delete',
      label: 'Delete case',
      icon: Trash2,
      tone: 'danger',
      onSelect: onDelete,
    },
  ]

  const meta = [
    caseDetails.leadLawyer
      ? { icon: UserRound, label: `Lead counsel: ${caseDetails.leadLawyer.fullName}` }
      : null,
    caseDetails.court ? { icon: Gavel, label: caseDetails.court } : null,
    { icon: Scale, label: practiceAreaLabels[caseDetails.practiceArea] },
  ].filter((entry): entry is { icon: typeof UserRound; label: string } =>
    Boolean(entry),
  )

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{caseDetails.caseNumber}</Badge>
            <StatusBadge status={caseDetails.status} />
            <PriorityBadge priority={caseDetails.priority} />
          </div>

          <h2 className="mt-3 font-display text-2xl text-navy sm:text-3xl">
            {caseDetails.title}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-secondary">
            {meta.map((entry) => {
              const Icon = entry.icon
              return (
                <span key={entry.label} className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5 text-blue" />
                  {entry.label}
                </span>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onShare}>
            <Share2 className="size-4" />
            Share
          </Button>
          <Button size="sm" variant="secondary" onClick={onPrint}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button size="sm" onClick={onEdit}>
            <Pencil className="size-4" />
            Edit Case
          </Button>
          <DropdownMenu
            triggerLabel="More case actions"
            trigger={<MoreHorizontal className="size-4" />}
            items={menuItems}
          />
        </div>
      </div>
    </Card>
  )
}
