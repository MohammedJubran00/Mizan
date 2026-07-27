import { Trash2 } from 'lucide-react'

import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

interface DeleteInvoiceDialogProps {
  open: boolean
  invoiceNumber: string
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteInvoiceDialog({
  open,
  invoiceNumber,
  deleting,
  onConfirm,
  onCancel,
}: DeleteInvoiceDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Delete invoice?"
      confirmLabel={deleting ? 'Deleting…' : 'Delete'}
      loading={deleting}
      onConfirm={onConfirm}
      onCancel={onCancel}
      icon={Trash2}
    >
      This action cannot be undone. Invoice{' '}
      <strong className="font-semibold text-navy">{invoiceNumber}</strong> and its
      payment history will be permanently removed.
    </ConfirmationDialog>
  )
}
