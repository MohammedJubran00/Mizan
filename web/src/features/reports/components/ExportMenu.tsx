import {
  Download,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
} from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'

import type { ExportFormat } from '../types'

interface ExportMenuProps {
  formats?: ExportFormat[]
  exporting?: boolean
  onExport: (format: ExportFormat) => void
  triggerLabel?: string
  size?: 'sm' | 'md'
}

export function ExportMenu({
  formats = ['PDF', 'CSV', 'XLS'],
  onExport,
  triggerLabel = 'Export',
  size = 'sm',
}: ExportMenuProps) {
  const items: DropdownMenuItem[] = formats.map((format) => ({
    id: format,
    label: `Export ${format}`,
    icon:
      format === 'PDF'
        ? FileText
        : format === 'CSV'
          ? Download
          : FileSpreadsheet,
    onSelect: () => onExport(format),
  }))

  return (
    <DropdownMenu
      triggerLabel={triggerLabel}
      trigger={
        <>
          <Download className="size-4" />
          {triggerLabel}
        </>
      }
      items={items}
      triggerClassName={
        size === 'sm'
          ? 'h-9 px-3 text-sm'
          : undefined
      }
    />
  )
}

interface CompactExportButtonProps {
  onClick: () => void
  loading?: boolean
  label?: string
}

export function CompactExportButton({
  onClick,
  loading,
  label = 'Export',
}: CompactExportButtonProps) {
  return (
    <Button size="sm" variant="secondary" loading={loading} onClick={onClick}>
      <MoreHorizontal className="size-4" />
      {label}
    </Button>
  )
}
