import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Input } from '@/shared/components/Input'
import { PersonPicker } from '@/shared/components/PersonPicker'
import { Select } from '@/shared/components/Select'

import { billingService } from '../api/billingService'
import type { useInvoiceForm } from '../hooks/useInvoiceForm'
import { currencyOptions, termsOptions } from '../lib/labels'

type InvoiceFormApi = ReturnType<typeof useInvoiceForm>

interface InvoiceGeneralStepProps {
  form: InvoiceFormApi
}

export function InvoiceGeneralStep({ form }: InvoiceGeneralStepProps) {
  const navigate = useNavigate()
  const { values, updateField, touchField, fieldError, goToItems } = form

  return (
    <Card className="p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <PersonPicker
            label="Client"
            required
            placeholder="Select a client…"
            queryKey="billing-client-picker"
            fetchPeople={(search) => billingService.searchClients(search)}
            selectedName={values.clientName}
            onSelect={(person) => {
              updateField('clientId', person?.id ?? '')
              updateField('clientName', person?.fullName ?? '')
              if (person) {
                updateField('caseId', '')
                updateField('caseLabel', '')
              }
            }}
            emptyMessage="No clients found. Create a client first."
            emptyActionLabel="Add client"
            onEmptyAction={() => navigate('/clients/new')}
            error={fieldError('clientId')}
            onBlurField={() => touchField('clientId')}
          />
        </div>

        <div className="sm:col-span-2">
          <PersonPicker
            label="Related case / matter"
            placeholder="Search by case ID or title…"
            queryKey={`billing-case-picker-${values.clientId || 'all'}`}
            fetchPeople={async (search) => {
              const cases = await billingService.searchCases(
                search,
                values.clientId || undefined,
              )
              return cases.map((item) => ({
                id: item.id,
                fullName: `${item.caseNumber} — ${item.title}`,
                subtitle: item.caseNumber,
              }))
            }}
            selectedName={values.caseLabel}
            onSelect={(person) => {
              updateField('caseId', person?.id ?? '')
              updateField('caseLabel', person?.fullName ?? '')
            }}
            emptyMessage="No cases found for this client."
            emptyActionLabel="Create case"
            onEmptyAction={() => navigate('/cases/new')}
            onBlurField={() => touchField('caseId')}
          />
        </div>

        <div className="sm:col-span-2">
          <PersonPicker
            label="Billing lawyer"
            required
            placeholder="Select a billing lawyer…"
            queryKey="billing-lawyer-picker"
            fetchPeople={(search) => billingService.searchLawyers(search)}
            selectedName={values.billingLawyerName}
            onSelect={(person) => {
              updateField('billingLawyerId', person?.id ?? '')
              updateField('billingLawyerName', person?.fullName ?? '')
            }}
            emptyMessage="No lawyers found in this workspace."
            error={fieldError('billingLawyerId')}
            onBlurField={() => touchField('billingLawyerId')}
          />
        </div>

        <Select
          label="Currency"
          required
          options={currencyOptions}
          value={values.currency}
          onChange={(event) =>
            updateField(
              'currency',
              event.target.value as typeof values.currency,
            )
          }
          onBlur={() => touchField('currency')}
          error={fieldError('currency')}
        />

        <Select
          label="Terms"
          required
          options={termsOptions}
          value={values.terms}
          onChange={(event) =>
            updateField('terms', event.target.value as typeof values.terms)
          }
          onBlur={() => touchField('terms')}
          error={fieldError('terms')}
        />

        <Input
          label="Issue date"
          type="date"
          required
          value={values.issueDate}
          onChange={(event) => updateField('issueDate', event.target.value)}
          onBlur={() => touchField('issueDate')}
          error={fieldError('issueDate')}
        />

        <Input
          label="Due date"
          type="date"
          required
          value={values.dueDate}
          onChange={(event) => updateField('dueDate', event.target.value)}
          onBlur={() => touchField('dueDate')}
          error={fieldError('dueDate')}
        />
      </div>

      <div className="mt-6 flex justify-end border-t border-border-subtle pt-4">
        <Button type="button" onClick={() => goToItems()}>
          Next: Items table
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </Card>
  )
}
