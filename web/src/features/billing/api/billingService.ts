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

/**
 * Placeholder data access layer for the billing module.
 *
 * Backend invoice/payment CRUD is not exposed yet, so every method resolves with
 * an empty result. Replace bodies with `apiClient` + `endpoints.billing` calls
 * once the API lands — the signatures below are the UI contract.
 */
export const billingService = {
  async getInvoices(params: InvoiceListParams): Promise<InvoiceListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async getInvoice(_id: string): Promise<InvoiceDetails | null> {
    return null
  },

  async createInvoice(_payload: InvoicePayload): Promise<InvoiceDetails | null> {
    return null
  },

  async updateInvoice(
    _id: string,
    _payload: Partial<InvoicePayload>,
  ): Promise<InvoiceDetails | null> {
    return null
  },

  async deleteInvoice(_id: string): Promise<void> {
    return Promise.resolve()
  },

  async duplicateInvoice(_id: string): Promise<InvoiceDetails | null> {
    return null
  },

  async voidInvoice(_id: string): Promise<InvoiceDetails | null> {
    return null
  },

  async markInvoicePaid(_id: string): Promise<InvoiceDetails | null> {
    return null
  },

  async sendInvoice(
    _id: string,
    _payload: SendInvoicePayload,
  ): Promise<void> {
    return Promise.resolve()
  },

  async downloadInvoicePdf(_id: string): Promise<Blob | null> {
    return null
  },

  async recordPayment(_payload: PaymentPayload): Promise<Payment | null> {
    return null
  },

  async getPayments(params: PaymentListParams): Promise<PaymentListResponse> {
    return {
      items: [],
      pagination: emptyPagination(params.page, params.pageSize),
    }
  },

  async getPayment(_id: string): Promise<Payment | null> {
    return null
  },

  async refundPayment(_id: string): Promise<Payment | null> {
    return null
  },

  async getRevenueSummary(): Promise<BillingSummary | null> {
    return null
  },

  async getRevenueProjection(
    _months = 6,
  ): Promise<RevenueProjectionPoint[]> {
    return []
  },

  async getRevenueInsights(): Promise<RevenueInsights | null> {
    return null
  },

  async getActionRequired(): Promise<BillingActionRequired[]> {
    return []
  },

  async getOutstandingInvoices(
    _search?: string,
  ): Promise<InvoiceListItem[]> {
    return []
  },

  async searchClients(_search?: string): Promise<BillingPersonRef[]> {
    return []
  },

  async searchCases(
    _search?: string,
    _clientId?: string,
  ): Promise<BillingCaseRef[]> {
    return []
  },

  async searchLawyers(_search?: string): Promise<BillingPersonRef[]> {
    return []
  },
}
