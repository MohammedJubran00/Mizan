import type { LucideIcon } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { cn } from '@/shared/lib/utils'

interface ConfirmationDialogProps {
  open: boolean
  title: string
  /** Rich body so callers can emphasise names or consequences. */
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  loading?: boolean
  icon?: LucideIcon
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  icon: Icon = AlertTriangle,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onCancel}
      title={title}
      size="sm"
      hideCloseButton
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full',
            tone === 'danger'
              ? 'bg-danger/10 text-danger'
              : 'bg-blue-soft text-blue',
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 text-sm leading-relaxed text-text-secondary">
          {children}
        </div>
      </div>
    </Modal>
  )
}
