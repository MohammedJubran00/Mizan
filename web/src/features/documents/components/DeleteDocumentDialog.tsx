import { Trash2 } from 'lucide-react'

import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

interface DeleteDocumentDialogProps {
  open: boolean
  documentTitle: string
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteDocumentDialog({
  open,
  documentTitle,
  deleting,
  onConfirm,
  onCancel,
}: DeleteDocumentDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Delete document?"
      confirmLabel={deleting ? 'Deleting…' : 'Delete'}
      loading={deleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
      icon={Trash2}
    >
      This action cannot be undone.{' '}
      <strong className="font-semibold text-navy">{documentTitle}</strong> will
      be permanently removed from your workspace.
    </ConfirmationDialog>
  )
}
