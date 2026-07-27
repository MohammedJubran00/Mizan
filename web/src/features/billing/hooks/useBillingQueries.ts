import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { toast } from '@/stores/toastStore'

import {
  billingService,
  type InvoiceListParams,
  type PaymentListParams,
} from '../api/billingService'
import { clientKeys } from '../../clients/hooks/useClientQueries'
import type {
  InvoiceDetails,
  InvoicePayload,
  PaymentPayload,
  SendInvoicePayload,
} from '../types'

export const billingKeys = {
  all: ['billing'] as const,
  list: (params: InvoiceListParams) => ['billing', 'invoices', params] as const,
  detail: (id: string) => ['billing', 'invoice', id] as const,
  summary: () => ['billing', 'summary'] as const,
  projection: () => ['billing', 'projection'] as const,
  payments: (params: PaymentListParams) =>
    ['billing', 'payments', params] as const,
  paymentDetail: (id: string) => ['billing', 'payment', id] as const,
  insights: () => ['billing', 'insights'] as const,
  actions: () => ['billing', 'actions'] as const,
  outstanding: (search?: string) =>
    ['billing', 'outstanding', search ?? ''] as const,
}

export type BillingResourceState = 'loading' | 'error' | 'empty' | 'ready'

function describeError(error: unknown) {
  return error instanceof Error ? error.message : 'Please try again.'
}

export function useInvoiceList(params: InvoiceListParams) {
  const query = useQuery({
    queryKey: billingKeys.list(params),
    queryFn: () => billingService.getInvoices(params),
  })

  const items = query.data?.items ?? []

  const state: BillingResourceState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : items.length === 0
        ? 'empty'
        : 'ready'

  return {
    items,
    pagination: query.data?.pagination,
    state,
    isSearching: query.isFetching && !query.isPending,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useBillingSummary() {
  const query = useQuery({
    queryKey: billingKeys.summary(),
    queryFn: () => billingService.getRevenueSummary(),
  })

  return {
    summary: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  }
}

export function useRevenueProjection() {
  const query = useQuery({
    queryKey: billingKeys.projection(),
    queryFn: () => billingService.getRevenueProjection(6),
  })

  return {
    points: query.data ?? [],
    isLoading: query.isPending,
  }
}

export function useInvoiceDetails(id: string | undefined) {
  const query = useQuery({
    queryKey: billingKeys.detail(id ?? 'unknown'),
    queryFn: () => billingService.getInvoice(id as string),
    enabled: Boolean(id),
  })

  const invoice: InvoiceDetails | null = query.data ?? null

  const state: BillingResourceState = !id
    ? 'empty'
    : query.isPending
      ? 'loading'
      : query.isError
        ? 'error'
        : invoice === null
          ? 'empty'
          : 'ready'

  return {
    invoice,
    state,
    error: query.error,
    refetch: query.refetch,
  }
}

export function usePaymentList(params: PaymentListParams) {
  const query = useQuery({
    queryKey: billingKeys.payments(params),
    queryFn: () => billingService.getPayments(params),
  })

  const items = query.data?.items ?? []

  const state: BillingResourceState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : items.length === 0
        ? 'empty'
        : 'ready'

  return {
    items,
    pagination: query.data?.pagination,
    state,
    isSearching: query.isFetching && !query.isPending,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useRevenueInsights() {
  const query = useQuery({
    queryKey: billingKeys.insights(),
    queryFn: () => billingService.getRevenueInsights(),
  })

  return {
    insights: query.data ?? null,
    isLoading: query.isPending,
  }
}

export function useBillingActions() {
  const query = useQuery({
    queryKey: billingKeys.actions(),
    queryFn: () => billingService.getActionRequired(),
  })

  return {
    actions: query.data ?? [],
    isLoading: query.isPending,
  }
}

interface BillingMutationCallbacks {
  onCreated?: (invoice: InvoiceDetails | null) => void
  onUpdated?: (invoice: InvoiceDetails | null) => void
  onDeleted?: () => void
  onDuplicated?: (invoice: InvoiceDetails | null) => void
  onSent?: () => void
  onPaymentRecorded?: () => void
}

export function useBillingMutations({
  onCreated,
  onUpdated,
  onDeleted,
  onDuplicated,
  onSent,
  onPaymentRecorded,
}: BillingMutationCallbacks = {}) {
  const queryClient = useQueryClient()

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: billingKeys.all })

  const createInvoice = useMutation({
    mutationFn: (payload: InvoicePayload) => billingService.createInvoice(payload),
    onSuccess: async (invoice, payload) => {
      await invalidateAll()
      // Keep the client profile in sync after creating an invoice.
      if (invoice?.client?.id) {
        await queryClient.invalidateQueries({
          queryKey: clientKeys.detail(invoice.client.id),
        })
      }
      await queryClient.invalidateQueries({ queryKey: clientKeys.all })
      toast.success(
        payload.status === 'DRAFT' ? 'Draft saved' : 'Invoice created',
        'The invoice has been saved.',
      )
      onCreated?.(invoice)
    },
    onError: (error) =>
      toast.error('Could not create invoice', describeError(error)),
  })

  const updateInvoice = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<InvoicePayload>
    }) => billingService.updateInvoice(id, payload),
    onSuccess: async (invoice, variables) => {
      await queryClient.invalidateQueries({
        queryKey: billingKeys.detail(variables.id),
      })
      await invalidateAll()
      if (invoice?.client?.id) {
        await queryClient.invalidateQueries({
          queryKey: clientKeys.detail(invoice.client.id),
        })
      }
      await queryClient.invalidateQueries({ queryKey: clientKeys.all })
      toast.success('Invoice updated', 'Your changes have been saved.')
      onUpdated?.(invoice)
    },
    onError: (error) =>
      toast.error('Could not update invoice', describeError(error)),
  })

  const deleteInvoice = useMutation({
    mutationFn: (id: string) => billingService.deleteInvoice(id),
    onSuccess: async (_result, id) => {
      queryClient.removeQueries({ queryKey: billingKeys.detail(id) })
      await invalidateAll()
      toast.success('Invoice deleted', 'The invoice was permanently removed.')
      onDeleted?.()
    },
    onError: (error) =>
      toast.error('Could not delete invoice', describeError(error)),
  })

  const duplicateInvoice = useMutation({
    mutationFn: (id: string) => billingService.duplicateInvoice(id),
    onSuccess: async (invoice) => {
      await invalidateAll()
      toast.success('Invoice duplicated', 'A draft copy has been created.')
      onDuplicated?.(invoice)
    },
    onError: (error) =>
      toast.error('Could not duplicate invoice', describeError(error)),
  })

  const voidInvoice = useMutation({
    mutationFn: (id: string) => billingService.voidInvoice(id),
    onSuccess: async (invoice, id) => {
      await queryClient.invalidateQueries({ queryKey: billingKeys.detail(id) })
      await invalidateAll()
      toast.success('Invoice voided', 'The invoice is no longer collectible.')
      onUpdated?.(invoice)
    },
    onError: (error) =>
      toast.error('Could not void invoice', describeError(error)),
  })

  const markInvoicePaid = useMutation({
    mutationFn: (id: string) => billingService.markInvoicePaid(id),
    onSuccess: async (invoice, id) => {
      await queryClient.invalidateQueries({ queryKey: billingKeys.detail(id) })
      await invalidateAll()
      toast.success('Marked as paid', 'The invoice balance is now settled.')
      onUpdated?.(invoice)
    },
    onError: (error) =>
      toast.error('Could not mark invoice paid', describeError(error)),
  })

  const sendInvoice = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: SendInvoicePayload
    }) => billingService.sendInvoice(id, payload),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: billingKeys.detail(variables.id),
      })
      await invalidateAll()
      toast.success('Invoice sent', 'The message was queued for delivery.')
      onSent?.()
    },
    onError: (error) =>
      toast.error('Could not send invoice', describeError(error)),
  })

  const downloadPdf = useMutation({
    mutationFn: async (id: string) => {
      const blob = await billingService.downloadInvoicePdf(id)
      if (!blob) {
        throw new Error(
          'PDF download is not available until the billing API is connected.',
        )
      }
      return blob
    },
    onSuccess: (blob, id) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${id}.pdf`
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success('Download started', 'Your invoice PDF is downloading.')
    },
    onError: (error) =>
      toast.error('Could not download PDF', describeError(error)),
  })

  const recordPayment = useMutation({
    mutationFn: (payload: PaymentPayload) =>
      billingService.recordPayment(payload),
    onSuccess: async (payment) => {
      await invalidateAll()
      if (payment?.invoiceId) {
        await queryClient.invalidateQueries({
          queryKey: billingKeys.detail(payment.invoiceId),
        })
      }
      toast.success('Payment recorded', 'The payment has been saved.')
      onPaymentRecorded?.()
    },
    onError: (error) =>
      toast.error('Could not record payment', describeError(error)),
  })

  const refundPayment = useMutation({
    mutationFn: (id: string) => billingService.refundPayment(id),
    onSuccess: async () => {
      await invalidateAll()
      toast.success('Payment refunded', 'The refund has been recorded.')
    },
    onError: (error) =>
      toast.error('Could not refund payment', describeError(error)),
  })

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    duplicateInvoice,
    voidInvoice,
    markInvoicePaid,
    sendInvoice,
    downloadPdf,
    recordPayment,
    refundPayment,
    isSaving: createInvoice.isPending || updateInvoice.isPending,
    isDeleting: deleteInvoice.isPending,
    isSending: sendInvoice.isPending,
    isDownloading: downloadPdf.isPending,
    isRecordingPayment: recordPayment.isPending,
  }
}
