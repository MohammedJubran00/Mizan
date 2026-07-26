import { FileText } from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { formatBytes, formatShortDate } from '@/shared/lib/utils'
import type { FileRef } from '@/shared/types/files'

const columns: DataTableColumn<FileRef>[] = [
  {
    id: 'title',
    header: 'Document',
    render: (row) => (
      <div className="flex min-w-0 items-center gap-2">
        <FileText className="size-4 shrink-0 text-blue" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy">{row.title}</p>
          <p className="truncate text-xs text-text-muted">{row.fileName}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'category',
    header: 'Category',
    render: (row) => <Badge variant="info">{row.category}</Badge>,
  },
  {
    id: 'size',
    header: 'Size',
    render: (row) => (
      <span className="text-text-secondary">{formatBytes(row.sizeBytes)}</span>
    ),
  },
  {
    id: 'created',
    header: 'Uploaded',
    render: (row) => (
      <div className="min-w-0">
        <p className="text-text-secondary">{formatShortDate(row.createdAt)}</p>
        {row.uploadedByName ? (
          <p className="truncate text-xs text-text-muted">{row.uploadedByName}</p>
        ) : null}
      </div>
    ),
  },
]

interface FileTableProps {
  files: FileRef[]
  caption: string
  emptyDescription: string
}

export function FileTable({ files, caption, emptyDescription }: FileTableProps) {
  return (
    <DataTable
      caption={caption}
      columns={columns}
      rows={files}
      rowKey={(row) => row.id}
      empty={
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description={emptyDescription}
          className="border-0 py-10"
        />
      }
    />
  )
}
