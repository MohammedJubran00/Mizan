export interface ClientPaymentSummary {
  totalPaid: number;
  outstanding: number;
  currency: string;
}

type InvoiceForPayment = {
  amount: unknown;
  currency: string;
  status: string;
};

/** Sum paid vs unpaid invoice amounts for a client. */
export function computeClientPayments(invoices: InvoiceForPayment[]): ClientPaymentSummary {
  let totalPaid = 0;
  let outstanding = 0;
  let currency = 'USD';

  for (const inv of invoices) {
    const amount = Number(inv.amount);
    if (inv.currency) currency = inv.currency;
    if (inv.status === 'PAID') {
      totalPaid += amount;
    } else if (inv.status === 'SENT' || inv.status === 'OVERDUE') {
      outstanding += amount;
    }
  }

  return { totalPaid, outstanding, currency };
}
