import { apiClient, getErrorMessage } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  BillingActionRequired,
  BillingCaseRef,
  BillingPagination,
  BillingPersonRef,
  BillingSummary,
  InvoiceDetails,
  InvoiceListItem,
  InvoiceListResponse,
  InvoicePayload,
  InvoiceStatus,
  Payment,
  PaymentListResponse,
  PaymentPayload,
  RevenueInsights,
  RevenueProjectionPoint,
  SendInvoicePayload,
} from '../types'

export interface InvoiceListParams {
  search?: string
  status: InvoiceStatus | 'ALL'
  page: number
  pageSize: number
}

export interface PaymentListParams {
  search?: string
  status: 'ALL' | 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED'
  page: number
  pageSize: number
}

function emptyPagination(page: number, pageSize: number): BillingPagination {
  return { page, pageSize, total: 0, totalPages: 0, hasMore: false }
}

export const billingService = {
  async getInvoices(params: InvoiceListParams): Promise<InvoiceListResponse> {
    try {
      const { data } = await apiClient.get<InvoiceListResponse>(endpoints.billing.invoices, {
        params: {
          search: params.search || undefined,
          status: params.status !== 'ALL' ? params.status : undefined,
          page: params.page,
          pageSize: params.pageSize,
        },
      })
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load invoices.'))
    }
  },

  async getInvoice(id: string): Promise<InvoiceDetails | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: InvoiceDetails }>(
        endpoints.billing.invoice(id),
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load invoice.'))
    }
  },

  async createInvoice(payload: InvoicePayload): Promise<InvoiceDetails | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: InvoiceDetails }>(
        endpoints.billing.invoices,
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create invoice.'))
    }
  },

  async updateInvoice(id: string, payload: Partial<InvoicePayload>): Promise<InvoiceDetails | null> {
    try {
      const { data } = await apiClient.patch<{ success: boolean; data: InvoiceDetails }>(
        endpoints.billing.invoice(id),
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update invoice.'))
    }
  },

  async deleteInvoice(id: string): Promise<void> {
    try {
      await apiClient.delete(endpoints.billing.invoice(id))
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete invoice.'))
    }
  },

  async duplicateInvoice(_id: string): Promise<InvoiceDetails | null> {
    // TODO: Backend duplicate endpoint not implemented
    return null
  },

  async voidInvoice(id: string): Promise<InvoiceDetails | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: InvoiceDetails }>(
        endpoints.billing.invoiceVoid(id),
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to void invoice.'))
    }
  },

  async markInvoicePaid(id: string): Promise<InvoiceDetails | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: InvoiceDetails }>(
        endpoints.billing.invoiceMarkPaid(id),
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to mark invoice as paid.'))
    }
  },

  async sendInvoice(id: string, _payload: SendInvoicePayload): Promise<void> {
    try {
      await apiClient.post(endpoints.billing.invoiceSend(id))
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to send invoice.'))
    }
  },

  async downloadInvoicePdf(_id: string): Promise<Blob | null> {
    // TODO: PDF generation not implemented
    return null
  },

  async recordPayment(payload: PaymentPayload): Promise<Payment | null> {
    try {
      const { data } = await apiClient.post<{ success: boolean; data: Payment }>(
        endpoints.billing.payments,
        payload,
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to record payment.'))
    }
  },

  async getPayments(params: PaymentListParams): Promise<PaymentListResponse> {
    try {
      const { data } = await apiClient.get<PaymentListResponse>(endpoints.billing.payments, {
        params: { page: params.page, pageSize: params.pageSize },
      })
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load payments.'))
    }
  },

  async getPayment(_id: string): Promise<Payment | null> {
    return null
  },

  async refundPayment(_id: string): Promise<Payment | null> {
    // TODO: Refund not implemented
    return null
  },

  async getRevenueSummary(): Promise<BillingSummary | null> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: BillingSummary }>(
        endpoints.billing.summary,
      )
      return data.data ?? null
    } catch {
      return null
    }
  },

  async getRevenueProjection(_months = 6): Promise<RevenueProjectionPoint[]> {
    // TODO: Revenue projection endpoint not implemented
    return []
  },

  async getRevenueInsights(): Promise<RevenueInsights | null> {
    // TODO: Insights endpoint not implemented
    return null
  },

  async getActionRequired(): Promise<BillingActionRequired[]> {
    // TODO: Actions endpoint not implemented
    return []
  },

  async getOutstandingInvoices(search?: string): Promise<InvoiceListItem[]> {
    try {
      const { data } = await apiClient.get<{ items: InvoiceListItem[] }>(
        endpoints.billing.invoices,
        { params: { status: 'OVERDUE', search: search || undefined, pageSize: 20 } },
      )
      return data.items ?? []
    } catch {
      return []
    }
  },

  async searchClients(search?: string): Promise<BillingPersonRef[]> {
    try {
      const { data } = await apiClient.get<{ items: any[] }>(endpoints.clients.root, {
        params: { search: search || undefined, pageSize: 20 },
      })
      return (data.items ?? []).map((c: any) => ({
        id: c.id,
        name: c.fullName ?? c.name ?? '',
        email: c.email ?? null,
        avatarUrl: c.avatarUrl ?? null,
      }))
    } catch {
      return []
    }
  },

  async searchCases(search?: string, clientId?: string): Promise<BillingCaseRef[]> {
    try {
      const { data } = await apiClient.get<{ items: any[] }>(endpoints.cases.root, {
        params: { search: search || undefined, clientId: clientId || undefined, pageSize: 20 },
      })
      return (data.items ?? []).map((c: any) => ({
        id: c.id,
        reference: c.caseNumber ?? c.id,
        title: c.title,
        clientId: c.client?.id ?? null,
        clientName: c.client?.name ?? null,
      }))
    } catch {
      return []
    }
  },

  async searchLawyers(search?: string): Promise<BillingPersonRef[]> {
    try {
      const { data } = await apiClient.get<{ items: any[] }>(endpoints.users.root, {
        params: { search: search || undefined, role: 'LAWYER', pageSize: 20 },
      })
      return (data.items ?? []).map((m: any) => ({
        id: m.userId ?? m.id,
        name: m.user?.fullName ?? m.fullName ?? '',
        email: m.user?.email ?? m.email ?? null,
        avatarUrl: m.user?.avatarUrl ?? null,
      }))
    } catch {
      return []
    }
  },
}
