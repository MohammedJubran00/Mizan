import { CheckCircle2 } from 'lucide-react'

import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

interface ActivateUserDialogProps {
  open: boolean
  userName: string
  activating: boolean
  bulkCount?: number
  onConfirm: () => void
  onCancel: () => void
}

export function ActivateUserDialog({
  open,
  userName,
  activating,
  bulkCount,
  onConfirm,
  onCancel,
}: ActivateUserDialogProps) {
  const isBulk = Boolean(bulkCount && bulkCount > 1)

  return (
    <ConfirmationDialog
      open={open}
      title={isBulk ? 'Activate selected users?' : 'Activate user?'}
      confirmLabel={activating ? 'Activating…' : 'Activate'}
      tone="primary"
      loading={activating}
      onConfirm={onConfirm}
      onCancel={onCancel}
      icon={CheckCircle2}
    >
      {isBulk ? (
        <>Selected accounts will regain access to the workspace.</>
      ) : (
        <>
          Restore access for{' '}
          <strong className="font-semibold text-navy">{userName}</strong>?
        </>
      )}
    </ConfirmationDialog>
  )
}
