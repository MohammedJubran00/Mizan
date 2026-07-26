import { Info, MapPin, Tag as TagIcon, UserRound } from 'lucide-react'
import type { FormEvent } from 'react'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Input } from '@/shared/components/Input'
import { SectionCard } from '@/shared/components/SectionCard'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'

import type { ClientFormApi } from '../hooks/useClientForm'
import { countryOptions } from '../lib/countries'
import { TagInput } from './TagInput'

interface ClientFormProps {
  form: ClientFormApi
  submitLabel: string
  saving: boolean
  onSubmit: () => void
  onCancel: () => void
}

export function ClientForm({
  form,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  const { values, errors, isValid, setField, blurField } = form

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    form.markSubmitted()

    if (!isValid) return
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <SectionCard
            title="Personal Info"
            icon={UserRound}
            bodyClassName="px-5 py-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="firstName"
                label="First Name"
                required
                autoComplete="given-name"
                placeholder="e.g. Alexander"
                value={values.firstName}
                error={errors.firstName}
                onChange={(event) => setField('firstName', event.target.value)}
                onBlur={() => blurField('firstName')}
              />
              <Input
                name="lastName"
                label="Last Name"
                required
                autoComplete="family-name"
                placeholder="e.g. Montgomery"
                value={values.lastName}
                error={errors.lastName}
                onChange={(event) => setField('lastName', event.target.value)}
                onBlur={() => blurField('lastName')}
              />
              <Input
                name="companyName"
                label="Company Name"
                className="sm:col-span-2"
                autoComplete="organization"
                placeholder="e.g. Global Logistics Corp"
                value={values.companyName}
                error={errors.companyName}
                onChange={(event) => setField('companyName', event.target.value)}
                onBlur={() => blurField('companyName')}
              />
              <Input
                name="nationalId"
                label="National ID"
                placeholder="ID-000-00-0000"
                value={values.nationalId}
                error={errors.nationalId}
                onChange={(event) => setField('nationalId', event.target.value)}
                onBlur={() => blurField('nationalId')}
              />
              <Input
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={values.dateOfBirth}
                error={errors.dateOfBirth}
                onChange={(event) => setField('dateOfBirth', event.target.value)}
                onBlur={() => blurField('dateOfBirth')}
              />
              <Input
                name="email"
                label="Email Address"
                type="email"
                required
                inputMode="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={values.email}
                error={errors.email}
                onChange={(event) => setField('email', event.target.value)}
                onBlur={() => blurField('email')}
              />
              <Input
                name="phone"
                label="Phone Number"
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                value={values.phone}
                error={errors.phone}
                onChange={(event) => setField('phone', event.target.value)}
                onBlur={() => blurField('phone')}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Address Details"
            icon={MapPin}
            bodyClassName="px-5 py-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                name="country"
                label="Country"
                placeholder="Select a country"
                options={countryOptions}
                value={values.country}
                error={errors.country}
                onChange={(event) => setField('country', event.target.value)}
                onBlur={() => blurField('country')}
              />
              <Input
                name="city"
                label="City"
                autoComplete="address-level2"
                placeholder="e.g. San Francisco"
                value={values.city}
                error={errors.city}
                onChange={(event) => setField('city', event.target.value)}
                onBlur={() => blurField('city')}
              />
              <Input
                name="street"
                label="Street Address"
                autoComplete="street-address"
                placeholder="e.g. 123 Market St"
                value={values.street}
                error={errors.street}
                onChange={(event) => setField('street', event.target.value)}
                onBlur={() => blurField('street')}
              />
              <Input
                name="postalCode"
                label="Postal Code"
                autoComplete="postal-code"
                placeholder="94103"
                value={values.postalCode}
                error={errors.postalCode}
                onChange={(event) => setField('postalCode', event.target.value)}
                onBlur={() => blurField('postalCode')}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Classification"
            icon={TagIcon}
            bodyClassName="space-y-5 px-5 py-5"
          >
            <TagInput
              label="Tags"
              values={values.tags}
              onAdd={form.addTag}
              onRemove={form.removeTag}
              placeholder="Add tag…"
              emptyLabel="No tags yet."
            />
            <Textarea
              name="notes"
              label="Internal Notes"
              rows={6}
              placeholder="Document any specific requirements or background information here…"
              value={values.notes}
              onChange={(event) => form.setNotes(event.target.value)}
            />
          </SectionCard>

          <Card className="flex gap-3 bg-surface-muted p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-blue" />
            <p className="text-xs leading-relaxed text-text-secondary">
              Fields marked with an asterisk are required. Profile changes are
              recorded in the client activity history for compliance.
            </p>
          </Card>
        </div>
      </div>

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-muted">
          {isValid
            ? 'All required fields are complete.'
            : 'Complete the required fields to enable saving.'}
        </p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!isValid} loading={saving}>
            {submitLabel}
          </Button>
        </div>
      </Card>
    </form>
  )
}
