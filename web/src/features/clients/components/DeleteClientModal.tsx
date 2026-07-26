import { Trash2 } from 'lucide-react'

import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

interface DeleteClientModalProps {
  open: boolean
  clientName: string
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteClientModal({
  open,
  clientName,
  deleting,
  onConfirm,
  onCancel,
}: DeleteClientModalProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Delete Client?"
      confirmLabel={deleting ? 'Deleting…' : 'Delete Client'}
      loading={deleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
      icon={Trash2}
    >
      This action cannot be undone. All data associated with{' '}
      <strong className="font-semibold text-navy">{clientName}</strong> will be
      permanently removed from our servers, including cases, files, and activity
      history.
    </ConfirmationDialog>
  )
}
