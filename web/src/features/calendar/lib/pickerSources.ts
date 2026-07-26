import { caseService } from '@/features/cases/api/caseService'
import { clientService } from '@/features/clients/api/clientService'
import type { PersonOption } from '@/shared/components/PersonPicker'

import { eventService } from '../api/eventService'
import type { EventCaseRef, EventPersonRef } from '../types'

/** Case option shaped so `PersonPicker` can render it and hand back a case ref. */
export type CaseOption = EventCaseRef & PersonOption

export async function searchClients(search: string): Promise<EventPersonRef[]> {
  const clients = await clientService.getClients({ search: search || undefined })

  return clients.map((client) => ({
    id: client.id,
    fullName: client.fullName,
    email: client.email,
    phone: client.phone,
    subtitle: client.companyName ?? null,
  }))
}

export async function searchCases(search: string): Promise<CaseOption[]> {
  const response = await caseService.getCases({
    search: search || undefined,
    status: 'ALL',
    practiceArea: 'ALL',
    priority: 'ALL',
    sortBy: 'createdAt',
    sortDir: 'desc',
    page: 1,
    pageSize: 10,
  })

  return response.items.map((item) => ({
    id: item.id,
    caseNumber: item.caseNumber,
    title: item.title,
    fullName: item.caseNumber,
    subtitle: item.title,
  }))
}

export async function searchLawyers(search: string): Promise<EventPersonRef[]> {
  return eventService.getAssignableLawyers(search || undefined)
}
