import { Copy, FileText, MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { DropdownMenu } from '@/shared/components/DropdownMenu'
import { formatShortDate, formatTime } from '@/shared/lib/utils'

import {
  hearingStatusLabels,
  hearingStatusVariants,
  hearingTypeLabels,
} from '../lib/labels'
import type { Hearing } from '../types'

interface HearingsTableProps {
  hearings: Hearing[]
  empty: ReactNode
  onViewTranscript: (hearing: Hearing) => void
  onCopyDetails: (hearing: Hearing) => void
}

export function HearingsTable({
  hearings,
  empty,
  onViewTranscript,
  onCopyDetails,
}: HearingsTableProps) {
  const columns: DataTableColumn<Hearing>[] = [
    {
      id: 'when',
      header: 'Date / time',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-soft text-blue">
            <span className="text-[9px] font-bold uppercase leading-none">
              {new Date(row.scheduledAt).toLocaleDateString(undefined, {
                month: 'short',
              })}
            </span>
            <span className="text-sm font-bold leading-none">
              {new Date(row.scheduledAt).getDate()}
            </span>
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">
              {formatShortDate(row.scheduledAt)}
            </p>
            <p className="text-xs text-text-muted">{formatTime(row.scheduledAt)}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'court',
      header: 'Court / location',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-text-secondary">{row.court ?? '—'}</p>
          {row.room ? (
            <p className="truncate text-xs text-text-muted">{row.room}</p>
          ) : null}
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      render: (row) => <Badge variant="neutral">{hearingTypeLabels[row.type]}</Badge>,
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={hearingStatusVariants[row.status]}>
          {hearingStatusLabels[row.status]}
        </Badge>
      ),
    },
    {
      id: 'judge',
      header: 'Judge',
      render: (row) => (
        <span className="text-text-secondary">{row.judgeName ?? '—'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-40 text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.transcriptUrl ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onViewTranscript(row)}
            >
              <FileText className="size-4" />
              Transcript
            </Button>
          ) : null}
          <DropdownMenu
            triggerLabel={`Actions for hearing on ${formatShortDate(row.scheduledAt)}`}
            trigger={<MoreHorizontal className="size-4" />}
            items={[
              {
                id: 'transcript',
                label: 'View transcript',
                icon: FileText,
                disabled: !row.transcriptUrl,
                onSelect: () => onViewTranscript(row),
              },
              {
                id: 'copy',
                label: 'Copy hearing details',
                icon: Copy,
                onSelect: () => onCopyDetails(row),
              },
            ]}
          />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      caption="Hearings recorded for this matter"
      columns={columns}
      rows={hearings}
      rowKey={(row) => row.id}
      empty={empty}
    />
  )
}