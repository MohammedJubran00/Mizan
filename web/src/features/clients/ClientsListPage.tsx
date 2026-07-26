import { AlertCircle, Plus, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Button } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'

import { ClientFilters } from './components/ClientFilters'
import { ClientListTable } from './components/ClientListTable'
import { ClientListSkeleton } from './components/ClientSkeletons'
import { DeleteClientModal } from './components/DeleteClientModal'
import { useClientList, useClientMutations } from './hooks/useClientQueries'
import type { Client, ClientStatus } from './types'

export function ClientsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ClientStatus | 'ALL'>('ALL')
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null)

  const debouncedSearch = useDebouncedValue(search, 300)

  const params = useMemo(
    () => ({ search: debouncedSearch.trim() || undefined, status }),
    [debouncedSearch, status],
  )

  const { clients, state, refetch } = useClientList(params)

  const { deleteClient, isDeleting } = useClientMutations({
    onDeleted: () => setPendingDelete(null),
  })

  const hasFilters = Boolean(params.search) || status !== 'ALL'

  function resetFilters() {
    setSearch('')
    setStatus('ALL')
  }

  return (
    <>
      <TopBar
        title="Clients"
        subtitle="Manage and organize your client list and information."
        actions={
          <Button size="sm" onClick={() => navigate('/clients/new')}>
            <Plus className="size-4" />
            New Client
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <ClientFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onReset={resetFilters}
          hasActiveFilters={hasFilters}
        />

        {state === 'loading' ? <ClientListSkeleton /> : null}

        {state === 'error' ? (
          <EmptyState
            icon={AlertCircle}
            title="Could not load clients"
            description="Something went wrong while loading the client directory. Please try again."
            action={
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {state === 'empty' || state === 'ready' ? (
          <ClientListTable
            clients={clients}
            onOpen={(client) => navigate(`/clients/${client.id}`)}
            onEdit={(client) => navigate(`/clients/${client.id}/edit`)}
            onDelete={(client) => setPendingDelete(client)}
            empty={
              hasFilters ? (
                <EmptyState
                  icon={Search}
                  title="No matching clients"
                  description="No clients match your current search and filters. Try adjusting them."
                  action={
                    <Button variant="secondary" onClick={resetFilters}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={Users}
                  title="No clients yet"
                  description="Start building your client directory by creating a profile. You can then link cases, invoices, and documents."
                  action={
                    <Button onClick={() => navigate('/clients/new')}>
                      <Plus className="size-4" />
                      Create Client
                    </Button>
                  }
                />
              )
            }
          />
        ) : null}
      </div>

      <DeleteClientModal
        open={pendingDelete !== null}
        clientName={pendingDelete?.fullName ?? ''}
        deleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteClient.mutate(pendingDelete.id)
        }}
      />
    </>
  )
}
