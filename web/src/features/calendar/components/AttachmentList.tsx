import { Download, Paperclip } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatBytes, formatShortDate } from '@/shared/lib/utils'

import type { EventAttachment } from '../types'

interface AttachmentListProps {
  attachments: EventAttachment[]
  downloadingId: string | null
  onDownload: (attachment: EventAttachment) => void
  action?: React.ReactNode
}

export function AttachmentList({
  attachments,
  downloadingId,
  onDownload,
  action,
}: AttachmentListProps) {
  return (
    <SectionCard
      title="Attachments"
      description={
        attachments.length > 0
          ? `${attachments.length} file${attachments.length === 1 ? '' : 's'}`
          : 'No files attached'
      }
      icon={Paperclip}
      action={action}
      bodyClassName="px-2 py-2"
    >
      {attachments.length === 0 ? (
        <p className="px-2 py-3 text-sm text-text-muted">
          Nothing attached yet. Upload agendas or briefs from the edit screen.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center gap-3 px-2 py-2.5">
              <Paperclip className="size-4 shrink-0 text-blue" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy">
                  {attachment.title || attachment.fileName}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {formatBytes(attachment.sizeBytes)} ·{' '}
                  {formatShortDate(attachment.createdAt)}
                  {attachment.uploadedByName ? ` · ${attachment.uploadedByName}` : ''}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                loading={downloadingId === attachment.id}
                onClick={() => onDownload(attachment)}
              >
                <Download className="size-4" />
                Download
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
