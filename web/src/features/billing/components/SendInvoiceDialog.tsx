import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Checkbox } from '@/shared/components/Checkbox'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Textarea } from '@/shared/components/Textarea'

import type { InvoiceDetails, SendInvoicePayload } from '../types'

interface SendInvoiceDialogProps {
  open: boolean
  invoice: InvoiceDetails | InvoiceListLite | null
  sending: boolean
  onClose: () => void
  onSend: (payload: SendInvoicePayload) => void
}

interface InvoiceListLite {
  id: string
  number: string
  client?: { fullName: string; email?: string | null } | null
}

interface FormState {
  recipient: string
  cc: string
  subject: string
  message: string
  includePdf: boolean
}

interface FormErrors {
  recipient?: string
  subject?: string
  message?: string
}

function buildDefaults(invoice: InvoiceListLite | null): FormState {
  const number = invoice?.number ?? 'invoice'
  const clientName = invoice?.client?.fullName ?? 'your client'

  return {
    recipient: invoice?.client?.email ?? '',
    cc: '',
    subject: `Invoice ${number}`,
    message: `Dear ${clientName},\n\nPlease find attached invoice ${number}. Payment is appreciated by the due date listed on the invoice.\n\nKind regards`,
    includePdf: true,
  }
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!values.recipient.trim()) errors.recipient = 'Recipient is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.recipient.trim())) {
    errors.recipient = 'Enter a valid email address.'
  }
  if (!values.subject.trim()) errors.subject = 'Subject is required.'
  if (!values.message.trim()) errors.message = 'Message is required.'
  return errors
}

export function SendInvoiceDialog({
  open,
  invoice,
  sending,
  onClose,
  onSend,
}: SendInvoiceDialogProps) {
  const [values, setValues] = useState<FormState>(() => buildDefaults(invoice))
  const [errors, setErrors] = useState<FormErrors>({})
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(buildDefaults(invoice))
    setErrors({})
    setAttempted(false)
  }, [open, invoice])

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field as keyof FormErrors]
        return next
      })
    }
  }

  function submit() {
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setAttempted(true)
    if (Object.keys(nextErrors).length > 0) return

    onSend({
      recipient: values.recipient.trim(),
      cc: values.cc.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
      includePdf: values.includePdf,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send invoice"
      description={
        invoice
          ? `Prepare a message for ${invoice.number}. Delivery is backend-ready.`
          : 'Prepare an invoice email.'
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={submit} loading={sending}>
            Send
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Recipient"
          type="email"
          required
          value={values.recipient}
          onChange={(event) => update('recipient', event.target.value)}
          error={attempted ? errors.recipient : undefined}
          placeholder="client@example.com"
          autoComplete="email"
        />
        <Input
          label="CC"
          type="email"
          value={values.cc}
          onChange={(event) => update('cc', event.target.value)}
          placeholder="optional@example.com"
          hint="Optional carbon copy recipients."
        />
        <Input
          label="Subject"
          required
          value={values.subject}
          onChange={(event) => update('subject', event.target.value)}
          error={attempted ? errors.subject : undefined}
        />
        <Textarea
          label="Message"
          required
          rows={7}
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
          error={attempted ? errors.message : undefined}
        />
        <Checkbox
          checked={values.includePdf}
          onChange={(event) => update('includePdf', event.target.checked)}
          label="Attach invoice PDF"
        />
      </div>
    </Modal>
  )
}
