import { Trash2 } from 'lucide-react'

import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

interface DeleteReportDialogProps {
  open: boolean
  reportName: string
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteReportDialog({
  open,
  reportName,
  deleting,
  onConfirm,
  onCancel,
}: DeleteReportDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Delete report?"
      confirmLabel={deleting ? 'Deleting…' : 'Delete'}
      loading={deleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
      icon={Trash2}
    >
      This action cannot be undone. Report{' '}
      <strong className="font-semibold text-navy">{reportName}</strong> and its
      schedules will be permanently removed.
    </ConfirmationDialog>
  )
}
