import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'

import { departmentOptions } from '../lib/labels'
import type { Department, InviteUserPayload, Role } from '../types'

interface InviteUserDialogProps {
  open: boolean
  inviting: boolean
  roles: Role[]
  onClose: () => void
  onInvite: (payload: InviteUserPayload) => void
}

interface FormState {
  email: string
  roleId: string
  department: Department | ''
  message: string
}

interface FormErrors {
  email?: string
  roleId?: string
  department?: string
}

const emptyForm: FormState = {
  email: '',
  roleId: '',
  department: '',
  message: '',
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!values.email.trim()) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.roleId) errors.roleId = 'Select a role.'
  if (!values.department) errors.department = 'Select a department.'
  return errors
}

export function InviteUserDialog({
  open,
  inviting,
  roles,
  onClose,
  onInvite,
}: InviteUserDialogProps) {
  const [values, setValues] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues(emptyForm)
    setErrors({})
    setAttempted(false)
  }, [open])

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

    onInvite({
      email: values.email.trim(),
      roleId: values.roleId,
      department: values.department as Department,
      message: values.message.trim() || undefined,
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite user"
      description="Send a workspace invitation. Delivery is backend-ready."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={inviting}>
            Cancel
          </Button>
          <Button onClick={submit} loading={inviting}>
            Send invitation
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
          error={attempted ? errors.email : undefined}
          placeholder="colleague@firm.com"
        />
        <Select
          label="Role"
          required
          options={roles.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
          placeholder={
            roles.length === 0 ? 'No roles available yet' : 'Select a role…'
          }
          value={values.roleId}
          onChange={(event) => update('roleId', event.target.value)}
          error={attempted ? errors.roleId : undefined}
          disabled={roles.length === 0}
        />
        <Select
          label="Department"
          required
          options={departmentOptions}
          placeholder="Select a department…"
          value={values.department}
          onChange={(event) =>
            update('department', event.target.value as Department)
          }
          error={attempted ? errors.department : undefined}
        />
        <Textarea
          label="Custom message"
          rows={4}
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
          placeholder="Optional note included in the invitation"
        />
      </div>
    </Modal>
  )
}
