import type { ClientPaymentSummary } from './client-payments';
import { computeClientPayments } from './client-payments';
import type { ClientRow } from '../repositories/client.repository';

export function mapClient(row: ClientRow, payments?: ClientPaymentSummary) {
  const activeCases = row.cases.filter((c) => !['CLOSED', 'WON', 'LOST', 'DISMISSED', 'ARCHIVED'].includes(c.status));
  const closedCases = row.cases.filter((c) => ['CLOSED', 'WON', 'LOST', 'DISMISSED', 'ARCHIVED'].includes(c.status));

  return {
    id: row.id,
    firstName: row.firstName ?? '',
    lastName: row.lastName ?? '',
    fullName: row.name,
    companyName: row.companyName ?? null,
    occupation: row.occupation ?? null,
    nationalId: row.nationalId ?? null,
    dateOfBirth: row.dateOfBirth?.toISOString() ?? null,
    avatarUrl: row.avatarUrl ?? null,
    email: row.email ?? '',
    phone: row.phone ?? '',
    status: row.status,
    city: row.addressCity ?? null,
    country: row.addressCountry ?? null,
    address: {
      country: row.addressCountry ?? '',
      city: row.addressCity ?? '',
      street: row.addressStreet ?? '',
      postalCode: row.addressPostalCode ?? '',
    },
    notes: row.notes ?? null,
    tags: (row.tags ?? []).map((t, i) => ({ id: `tag-${i}`, label: t })),
    stats: {
      activeCases: activeCases.length,
      closedCases: closedCases.length,
    },
    payments: payments ?? computeClientPayments(row.invoices),
    clientSince: row.createdAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    cases: row.cases.map((c) => ({
      id: c.id,
      reference: c.caseNumber ?? c.id.slice(0, 8).toUpperCase(),
      title: c.title,
      status: c.status,
      practiceArea: c.practiceArea ?? null,
      openedAt: c.openedAt.toISOString(),
      closedAt: c.closedAt?.toISOString() ?? null,
    })),
    invoices: row.invoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount: Number(inv.amount),
      currency: inv.currency,
      status: inv.status,
      issuedAt: inv.issuedAt.toISOString(),
    })),
    documents: row.documents.map((d) => ({
      id: d.id,
      title: d.title,
      fileName: d.fileName,
      category: d.category,
      sizeBytes: d.sizeBytes,
      createdAt: d.createdAt.toISOString(),
    })),
    activities: [],
  };
}
