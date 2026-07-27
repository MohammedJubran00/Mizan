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

function toApiInvoiceBody(payload: Partial<InvoicePayload>) {
  const items = (payload.items ?? []).map((item, index) => ({
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    taxRate: item.taxRate ?? 0,
    discountRate: item.discountRate ?? 0,
    sortOrder: index,
  }))

  const amount = items.reduce((sum, item) => {
    const gross = item.quantity * item.rate
    const afterDiscount = gross * (1 - item.discountRate / 100)
    return sum + afterDiscount * (1 + item.taxRate / 100)
  }, 0)

  const stamp = new Date()
  const number = `INV-${stamp.getFullYear()}${String(stamp.getMonth() + 1).padStart(2, '0')}${String(stamp.getDate()).padStart(2, '0')}-${String(stamp.getTime()).slice(-5)}`

  return {
    clientId: payload.clientId || null,
    caseId: payload.caseId || null,
    billingLawyerUserId: payload.billingLawyerId || null,
    number,
    amount,
    currency: payload.currency ?? 'USD',
    status: payload.status ?? 'DRAFT',
    issuedAt: payload.issueDate || undefined,
    dueAt: payload.dueDate || null,
    terms: payload.terms || 'NET_30',
    paymentInstructions: payload.paymentInstructions || null,
    caseSummary: payload.caseSummary || null,
    items,
  }
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
        toApiInvoiceBody(payload),
      )
      return data.data ?? null
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create invoice.'))
    }
  },

  async updateInvoice(id: string, payload: Partial<InvoicePayload>): Promise<InvoiceDetails | null> {
    try {
      const body = toApiInvoiceBody(payload as InvoicePayload)
      // Keep existing invoice number on update — omit generated number.
      const { number: _number, ...updateBody } = body
      const { data } = await apiClient.patch<{ success: boolean; data: InvoiceDetails }>(
        endpoints.billing.invoice(id),
        updateBody,
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
      const { data } = await apiClient.get<{ success: boolean; data: any }>(
        endpoints.billing.summary,
      )
      const raw = data.data
      if (!raw) return null

      const byStatus: Array<{ status: string; count: number; total: number }> =
        raw.invoicesByStatus ?? []
      const countFor = (status: string) =>
        byStatus.find((row) => row.status === status)?.count ?? 0

      const paidInvoiceCount = Number(raw.paidInvoiceCount ?? countFor('PAID'))
      const overdueInvoiceCount = Number(
        raw.overdueInvoiceCount ?? countFor('OVERDUE'),
      )
      const issuedCount = byStatus.reduce((sum, row) => sum + row.count, 0)
      const paidProgress = Number(
        raw.paidProgress ??
          (issuedCount === 0 ? 0 : (paidInvoiceCount / issuedCount) * 100),
      )

      return {
        totalRevenue: Number(raw.totalRevenue ?? 0),
        outstandingBalance: Number(
          raw.outstandingBalance ?? raw.outstanding ?? 0,
        ),
        paidInvoiceCount,
        overdueInvoiceCount,
        paymentsThisMonth: Number(raw.paymentsThisMonth ?? 0),
        currency: raw.currency ?? 'USD',
        urgentOutstandingCount: Number(
          raw.urgentOutstandingCount ?? overdueInvoiceCount,
        ),
        paidProgress,
      }
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
      return (data.items ?? [])
        .map((c: any) => ({
          id: c.id,
          fullName: c.fullName ?? c.name ?? c.companyName ?? 'Unnamed client',
          email: c.email ?? null,
          subtitle: c.companyName ?? c.email ?? null,
          avatarUrl: c.avatarUrl ?? null,
        }))
        .filter((c) => Boolean(c.id))
    } catch {
      return []
    }
  },

  async searchCases(search?: string, clientId?: string): Promise<BillingCaseRef[]> {
    try {
      const { data } = await apiClient.get<{ items: any[] }>(endpoints.cases.root, {
        params: {
          search: search || undefined,
          clientId: clientId || undefined,
          pageSize: 20,
        },
      })
      return (data.items ?? [])
        .map((c: any) => ({
          id: c.id,
          caseNumber: c.caseNumber ?? c.id?.slice?.(0, 8)?.toUpperCase?.() ?? 'CASE',
          title: c.title ?? 'Untitled case',
          clientId: c.client?.id ?? null,
        }))
        .filter((c) => Boolean(c.id))
    } catch {
      return []
    }
  },

  async searchLawyers(search?: string): Promise<BillingPersonRef[]> {
    try {
      const { data } = await apiClient.get<{ items: any[] }>(endpoints.users.root, {
        params: { search: search || undefined, pageSize: 50 },
      })
      return (data.items ?? [])
        .map((m: any) => ({
          id: m.userId ?? m.user?.id ?? m.id,
          fullName: m.user?.fullName ?? m.fullName ?? 'Team member',
          email: m.user?.email ?? m.email ?? null,
          subtitle: m.role ?? m.jobTitle ?? null,
          avatarUrl: m.user?.avatarUrl ?? m.avatarUrl ?? null,
        }))
        .filter((m) => Boolean(m.id))
    } catch {
      return []
    }
  },
}
