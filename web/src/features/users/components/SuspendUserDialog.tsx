import { Ban } from 'lucide-react'

import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

interface SuspendUserDialogProps {
  open: boolean
  userName: string
  suspending: boolean
  bulkCount?: number
  onConfirm: () => void
  onCancel: () => void
}

export function SuspendUserDialog({
  open,
  userName,
  suspending,
  bulkCount,
  onConfirm,
  onCancel,
}: SuspendUserDialogProps) {
  const isBulk = Boolean(bulkCount && bulkCount > 1)

  return (
    <ConfirmationDialog
      open={open}
      title={isBulk ? 'Suspend selected users?' : 'Suspend user?'}
      confirmLabel={suspending ? 'Suspending…' : 'Suspend'}
      loading={suspending}
      onConfirm={onConfirm}
      onCancel={onCancel}
      icon={Ban}
    >
      {isBulk ? (
        <>Selected accounts will temporarily lose access to the workspace.</>
      ) : (
        <>
          <strong className="font-semibold text-navy">{userName}</strong> will
          temporarily lose access until reactivated.
        </>
      )}
    </ConfirmationDialog>
  )
}
