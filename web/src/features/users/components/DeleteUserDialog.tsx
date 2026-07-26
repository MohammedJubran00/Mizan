import { Trash2 } from 'lucide-react'

import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

interface DeleteUserDialogProps {
  open: boolean
  userName: string
  deleting: boolean
  bulkCount?: number
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteUserDialog({
  open,
  userName,
  deleting,
  bulkCount,
  onConfirm,
  onCancel,
}: DeleteUserDialogProps) {
  const isBulk = Boolean(bulkCount && bulkCount > 1)

  return (
    <ConfirmationDialog
      open={open}
      title={isBulk ? 'Delete selected users?' : 'Delete user?'}
      confirmLabel={deleting ? 'Deleting…' : 'Delete'}
      loading={deleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
      icon={Trash2}
    >
      {isBulk ? (
        <>
          This action cannot be undone. {bulkCount} user records will be
          permanently removed.
        </>
      ) : (
        <>
          This action cannot be undone. All data associated with{' '}
          <strong className="font-semibold text-navy">{userName}</strong> will be
          permanently removed.
        </>
      )}
    </ConfirmationDialog>
  )
}
