import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Input } from '@/shared/components/Input'
import { Textarea } from '@/shared/components/Textarea'
import { formatMoney } from '@/shared/lib/utils'

import type { useInvoiceForm } from '../hooks/useInvoiceForm'
import { previewLineAmount } from '../lib/invoiceForm'

type InvoiceFormApi = ReturnType<typeof useInvoiceForm>

interface InvoiceItemsStepProps {
  form: InvoiceFormApi
  saving: boolean
  onSaveDraft: () => void
  onCreate: () => void
}

export function InvoiceItemsStep({
  form,
  saving,
  onSaveDraft,
  onCreate,
}: InvoiceItemsStepProps) {
  const {
    values,
    updateField,
    updateItem,
    addItem,
    removeItem,
    itemFieldError,
    errors,
    goToGeneral,
  } = form

  const currency = values.currency || 'USD'

  return (
    <Card className="p-5">
      <div className="space-y-4">
        {values.items.map((item, index) => (
          <div
            key={item.key}
            className="rounded-xl border border-border-subtle p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-navy">
                Item {index + 1}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-muted">
                  {formatMoney(previewLineAmount(item), currency)}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={`Remove item ${index + 1}`}
                  disabled={values.items.length <= 1}
                  onClick={() => removeItem(item.key)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="sm:col-span-2 lg:col-span-5">
                <Input
                  label="Description"
                  required
                  value={item.description}
                  onChange={(event) =>
                    updateItem(item.key, 'description', event.target.value)
                  }
                  error={itemFieldError(item.key, 'description')}
                  placeholder="Service or expense description"
                />
              </div>
              <Input
                label="Quantity"
                type="number"
                min="0"
                step="0.01"
                required
                value={item.quantity}
                onChange={(event) =>
                  updateItem(item.key, 'quantity', event.target.value)
                }
                error={itemFieldError(item.key, 'quantity')}
              />
              <Input
                label="Rate"
                type="number"
                min="0"
                step="0.01"
                required
                value={item.rate}
                onChange={(event) =>
                  updateItem(item.key, 'rate', event.target.value)
                }
                error={itemFieldError(item.key, 'rate')}
              />
              <Input
                label="Tax %"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={item.taxRate}
                onChange={(event) =>
                  updateItem(item.key, 'taxRate', event.target.value)
                }
                error={itemFieldError(item.key, 'taxRate')}
              />
              <Input
                label="Discount %"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={item.discountRate}
                onChange={(event) =>
                  updateItem(item.key, 'discountRate', event.target.value)
                }
                error={itemFieldError(item.key, 'discountRate')}
              />
            </div>
          </div>
        ))}

        {errors.items ? (
          <p className="text-xs text-danger" role="alert">
            {errors.items}
          </p>
        ) : null}

        <Button type="button" variant="secondary" size="sm" onClick={addItem}>
          <Plus className="size-4" />
          Add item
        </Button>

        <div className="grid gap-4 border-t border-border-subtle pt-4 sm:grid-cols-2">
          <Textarea
            label="Payment instructions"
            rows={3}
            value={values.paymentInstructions}
            onChange={(event) =>
              updateField('paymentInstructions', event.target.value)
            }
            placeholder="ACH, wire, or card payment notes for the client"
          />
          <Textarea
            label="Case summary"
            rows={3}
            value={values.caseSummary}
            onChange={(event) => updateField('caseSummary', event.target.value)}
            placeholder="Optional matter context shown on the invoice"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
        <Button type="button" variant="ghost" onClick={goToGeneral}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            loading={saving}
            onClick={onSaveDraft}
          >
            Save draft
          </Button>
          <Button type="button" loading={saving} onClick={onCreate}>
            Create invoice
          </Button>
        </div>
      </div>
    </Card>
  )
}
