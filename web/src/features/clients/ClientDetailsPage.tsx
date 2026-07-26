import { AlertCircle, ArrowLeft, Plus, UserRound, Users } from 'lucide-react'
import { useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { InfoCard, type InfoItem } from '@/shared/components/InfoCard'
import { TabPanel, Tabs, type TabItem } from '@/shared/components/Tabs'
import { formatShortDate } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { ActivityFeed } from './components/ActivityFeed'
import { ClientDetailsSkeleton } from './components/ClientSkeletons'
import { ClientHeader } from './components/ClientHeader'
import { ClientStatsGrid } from './components/ClientStatsCard'
import { ClientTags } from './components/ClientTags'
import { DeleteClientModal } from './components/DeleteClientModal'
import { NotesCard } from './components/NotesCard'
import { CasesTab } from './components/tabs/CasesTab'
import { DocumentsTab } from './components/tabs/DocumentsTab'
import { InvoicesTab } from './components/tabs/InvoicesTab'
import { useClientDetails, useClientMutations } from './hooks/useClientQueries'
import { countryLabel } from './lib/countries'
import type { ClientDetails } from './types'

const TAB_IDS = ['overview', 'cases', 'documents', 'invoices', 'timeline'] as const
type TabId = (typeof TAB_IDS)[number]

function isTabId(value: string | null): value is TabId {
  return value !== null && (TAB_IDS as readonly string[]).includes(value)
}

export function ClientDetailsPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { client, state, refetch } = useClientDetails(clientId)

  const { updateClient, deleteClient, isSaving, isDeleting } = useClientMutations({
    onDeleted: () => navigate('/clients', { replace: true }),
  })

  const activeTab: TabId = isTabId(searchParams.get('tab'))
    ? (searchParams.get('tab') as TabId)
    : 'overview'

  const setActiveTab = useCallback(
    (tab: string) => {
      const next = new URLSearchParams(searchParams)
      if (tab === 'overview') next.delete('tab')
      else next.set('tab', tab)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const deleteOpen = searchParams.get('action') === 'delete'

  const setDeleteOpen = useCallback(
    (open: boolean) => {
      const next = new URLSearchParams(searchParams)
      if (open) next.set('action', 'delete')
      else next.delete('action')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`, value)
    } catch {
      toast.error('Could not copy', 'Clipboard access was denied by the browser.')
    }
  }

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Client" subtitle="Loading client profile…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ClientDetailsSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Client" subtitle="Client profile" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load client"
            description="Something went wrong while loading this client profile. Please try again."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => refetch()}>
                  Retry
                </Button>
                <Button variant="ghost" onClick={() => navigate('/clients')}>
                  <ArrowLeft className="size-4" />
                  Back to clients
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  if (state === 'empty' || client === null) {
    return (
      <>
        <TopBar title="Clients" subtitle="Client profile" />
        <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: 'Clients', to: '/clients' }, { label: 'Details' }]}
          />
          <EmptyState
            icon={UserRound}
            title="No client selected."
            description="Select a client from the directory to view their profile, or create a new client to get started."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => navigate('/clients/new')}>
                  <Plus className="size-4" />
                  Create Client
                </Button>
                <Button variant="secondary" onClick={() => navigate('/clients')}>
                  <Users className="size-4" />
                  Browse clients
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'cases', label: 'Cases', count: client.cases.length },
    { id: 'documents', label: 'Documents', count: client.documents.length },
    { id: 'invoices', label: 'Invoices', count: client.invoices.length },
    { id: 'timeline', label: 'Timeline' },
  ]

  const infoItems = buildInfoItems(client)

  function saveTags(tags: string[]) {
    updateClient.mutate({ id: client!.id, payload: { tags } })
  }

  return (
    <>
      <TopBar
        title={client.fullName}
        subtitle={client.companyName ?? 'Client profile'}
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Clients', to: '/clients' },
              { label: client.fullName },
            ]}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/clients')}
            className="sm:hidden"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <ClientHeader
          client={client}
          statusPending={isSaving}
          onEdit={() => navigate(`/clients/${client.id}/edit`)}
          onDelete={() => setDeleteOpen(true)}
          onToggleStatus={() =>
            updateClient.mutate({
              id: client.id,
              payload: {
                status: client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
              },
            })
          }
          onCopy={(field) =>
            copyToClipboard(
              field === 'email' ? client.email : client.phone,
              field === 'email' ? 'Email address' : 'Phone number',
            )
          }
        />

        <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
          <div className="space-y-6">
            <InfoCard
              title="Personal Information"
              icon={UserRound}
              items={infoItems}
            />
            <ClientTags
              tags={client.tags}
              pending={isSaving}
              onAdd={(label) =>
                saveTags([...client.tags.map((tag) => tag.label), label])
              }
              onRemove={(label) =>
                saveTags(
                  client.tags
                    .map((tag) => tag.label)
                    .filter((tag) => tag !== label),
                )
              }
            />
            <NotesCard
              notes={client.notes}
              pending={isSaving}
              onSave={(notes) =>
                updateClient.mutate({ id: client.id, payload: { notes } })
              }
            />
          </div>

          <div className="space-y-6">
            <ClientStatsGrid stats={client.stats} payments={client.payments} />

            <div>
              <Card className="px-2 pt-1">
                <Tabs
                  idPrefix="client"
                  items={tabs}
                  value={activeTab}
                  onChange={setActiveTab}
                  className="border-b-0"
                />
              </Card>

              <div className="pt-6">
                <TabPanel idPrefix="client" id="overview" active={activeTab === 'overview'}>
                  <ActivityFeed activities={client.activities} />
                </TabPanel>

                <TabPanel idPrefix="client" id="cases" active={activeTab === 'cases'}>
                  <CasesTab cases={client.cases} />
                </TabPanel>

                <TabPanel
                  idPrefix="client"
                  id="documents"
                  active={activeTab === 'documents'}
                >
                  <DocumentsTab documents={client.documents} />
                </TabPanel>

                <TabPanel
                  idPrefix="client"
                  id="invoices"
                  active={activeTab === 'invoices'}
                >
                  <InvoicesTab invoices={client.invoices} />
                </TabPanel>

                <TabPanel
                  idPrefix="client"
                  id="timeline"
                  active={activeTab === 'timeline'}
                >
                  <ActivityFeed
                    activities={client.activities}
                    title="Timeline"
                    variant="timeline"
                  />
                </TabPanel>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteClientModal
        open={deleteOpen}
        clientName={client.fullName}
        deleting={isDeleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteClient.mutate(client.id)}
      />
    </>
  )
}

function buildInfoItems(client: ClientDetails): InfoItem[] {
  const addressLines = [
    client.address.street,
    [client.address.city, client.address.postalCode].filter(Boolean).join(' '),
    countryLabel(client.address.country),
  ].filter(Boolean)

  return [
    {
      label: 'Email Address',
      value: client.email,
      href: client.email ? `mailto:${client.email}` : undefined,
    },
    {
      label: 'Phone Number',
      value: client.phone,
      href: client.phone ? `tel:${client.phone}` : undefined,
    },
    { label: 'Address', value: addressLines.join(', ') },
    { label: 'Occupation', value: client.occupation },
    { label: 'Company', value: client.companyName },
    { label: 'National ID', value: client.nationalId },
    {
      label: 'Date of Birth',
      value: client.dateOfBirth ? formatShortDate(client.dateOfBirth) : null,
    },
  ]
}
