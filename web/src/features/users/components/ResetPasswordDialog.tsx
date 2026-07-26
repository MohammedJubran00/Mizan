import { KeyRound } from 'lucide-react'

import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

interface ResetPasswordDialogProps {
  open: boolean
  userName: string
  resetting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ResetPasswordDialog({
  open,
  userName,
  resetting,
  onConfirm,
  onCancel,
}: ResetPasswordDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Reset password?"
      confirmLabel={resetting ? 'Sending…' : 'Send reset email'}
      tone="primary"
      loading={resetting}
      onConfirm={onConfirm}
      onCancel={onCancel}
      icon={KeyRound}
    >
      A password reset email will be queued for{' '}
      <strong className="font-semibold text-navy">{userName}</strong>. Delivery is
      backend-ready.
    </ConfirmationDialog>
  )
}
