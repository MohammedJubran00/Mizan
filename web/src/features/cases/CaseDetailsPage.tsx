import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarClock,
  CreditCard,
  FileText,
  Plus,
  StickyNote,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { MetricCard } from '@/shared/components/MetricCard'
import { TabPanel, Tabs, type TabItem } from '@/shared/components/Tabs'
import { formatCount, formatMoney } from '@/shared/lib/utils'
import { toast } from '@/stores/toastStore'

import { CaseDetailsSkeleton } from './components/CaseSkeletons'
import { CaseHeader } from './components/CaseHeader'
import { ClientCard } from './components/ClientCard'
import { LawyerCard } from './components/LawyerCard'
import { StatusModal } from './components/StatusModal'
import { BillingTab } from './components/tabs/BillingTab'
import { DocumentsTab } from './components/tabs/DocumentsTab'
import { HearingsTab } from './components/tabs/HearingsTab'
import { NotesTab } from './components/tabs/NotesTab'
import { OverviewTab } from './components/tabs/OverviewTab'
import { TimelineCard } from './components/TimelineCard'
import { useCaseDetails, useCaseMutations } from './hooks/useCaseQueries'

const TAB_IDS = [
  'overview',
  'hearings',
  'documents',
  'notes',
  'timeline',
  'billing',
] as const

type TabId = (typeof TAB_IDS)[number]

function isTabId(value: string | null): value is TabId {
  return value !== null && (TAB_IDS as readonly string[]).includes(value)
}

export function CaseDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { caseDetails, state, refetch } = useCaseDetails(caseId)

  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { updateStatus, deleteCase, createNote, isUpdating, isDeleting, isCreatingNote } =
    useCaseMutations({
      onStatusChanged: () => setStatusOpen(false),
      onDeleted: () => navigate('/cases', { replace: true }),
    })

  const activeTab: TabId = isTabId(searchParams.get('tab'))
    ? (searchParams.get('tab') as TabId)
    : 'overview'

  const setActiveTab = useCallback(
    (tab: string, action?: string) => {
      const next = new URLSearchParams(searchParams)
      if (tab === 'overview') next.delete('tab')
      else next.set('tab', tab)
      if (action) next.set('action', action)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied', 'Share this case with your team.')
    } catch {
      toast.error('Could not copy link', 'Clipboard access was denied.')
    }
  }

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Case" subtitle="Loading matter…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <CaseDetailsSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Case" subtitle="Matter details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load case"
            description="Something went wrong while loading this matter. Please try again."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => refetch()}>
                  Retry
                </Button>
                <Button variant="ghost" onClick={() => navigate('/cases')}>
                  <ArrowLeft className="size-4" />
                  Back to cases
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  if (state === 'empty' || caseDetails === null) {
    return (
      <>
        <TopBar title="Cases" subtitle="Matter details" />
        <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: 'Cases', to: '/cases' }, { label: 'Details' }]}
          />
          <EmptyState
            icon={Briefcase}
            title="No case selected."
            description="Select a matter from the case list to review its hearings, documents, and billing, or create a new case to get started."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => navigate('/cases/new')}>
                  <Plus className="size-4" />
                  Create Case
                </Button>
                <Button variant="secondary" onClick={() => navigate('/cases')}>
                  <Briefcase className="size-4" />
                  Browse cases
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  const { counters, billing } = caseDetails
  const currency = billing.payments.currency

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'hearings', label: 'Hearings', count: counters.hearings },
    { id: 'documents', label: 'Documents', count: counters.documents },
    { id: 'notes', label: 'Notes', count: counters.notes },
    { id: 'timeline', label: 'Timeline' },
    { id: 'billing', label: 'Billing' },
  ]

  return (
    <>
      <TopBar title={caseDetails.caseNumber} subtitle={caseDetails.title} />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Cases', to: '/cases' },
              { label: caseDetails.caseNumber },
            ]}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/cases')}
            className="sm:hidden"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <CaseHeader
          caseDetails={caseDetails}
          onEdit={() => navigate(`/cases/${caseDetails.id}/edit`)}
          onChangeStatus={() => setStatusOpen(true)}
          onShare={share}
          onPrint={() => window.print()}
          onScheduleHearing={() => setActiveTab('hearings', 'schedule')}
          onDelete={() => setDeleteOpen(true)}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Hearings"
            value={formatCount(counters.hearings)}
            icon={CalendarClock}
            action={
              <button
                type="button"
                onClick={() => setActiveTab('hearings')}
                className="rounded px-1 text-[10px] font-bold uppercase tracking-wide text-blue transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30"
              >
                View all
              </button>
            }
          />
          <MetricCard
            label="Documents"
            value={formatCount(counters.documents)}
            icon={FileText}
          />
          <MetricCard
            label="Notes"
            value={formatCount(counters.notes)}
            icon={StickyNote}
          />
          <MetricCard
            label="Total billing"
            value={formatMoney(billing.totalBilled, currency)}
            icon={CreditCard}
          />
          <MetricCard
            label="Outstanding"
            value={formatMoney(billing.payments.outstanding, currency)}
            icon={AlertCircle}
            tone={billing.payments.outstanding > 0 ? 'danger' : 'default'}
          />
        </div>

        <Card className="px-2 pt-1">
          <Tabs
            idPrefix="case"
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            className="border-b-0"
          />
        </Card>

        <div
          className={
            activeTab === 'overview'
              ? 'grid gap-6 xl:grid-cols-[1fr_20rem]'
              : 'grid gap-6'
          }
        >
          <div className="min-w-0 space-y-6">
            <TabPanel idPrefix="case" id="overview" active={activeTab === 'overview'}>
              <OverviewTab
                caseDetails={caseDetails}
                onEditInfo={() => navigate(`/cases/${caseDetails.id}/edit`)}
              />
            </TabPanel>

            <TabPanel idPrefix="case" id="hearings" active={activeTab === 'hearings'}>
              <HearingsTab caseDetails={caseDetails} />
            </TabPanel>

            <TabPanel
              idPrefix="case"
              id="documents"
              active={activeTab === 'documents'}
            >
              <DocumentsTab documents={caseDetails.documents} />
            </TabPanel>

            <TabPanel idPrefix="case" id="notes" active={activeTab === 'notes'}>
              <NotesTab
                notes={caseDetails.notes}
                saving={isCreatingNote}
                onAddNote={(payload) =>
                  createNote.mutateAsync({
                    caseId: caseDetails.id,
                    title: payload.title,
                    body: payload.body,
                  })
                }
              />
            </TabPanel>

            <TabPanel idPrefix="case" id="timeline" active={activeTab === 'timeline'}>
              <TimelineCard events={caseDetails.timeline} title="Case Timeline" />
            </TabPanel>

            <TabPanel idPrefix="case" id="billing" active={activeTab === 'billing'}>
              <BillingTab billing={billing} />
            </TabPanel>
          </div>

          {activeTab === 'overview' ? (
            <aside className="space-y-6">
              <ClientCard client={caseDetails.client} />
              <LawyerCard lawyer={caseDetails.leadLawyer} team={caseDetails.team} />
            </aside>
          ) : null}
        </div>
      </div>

      <StatusModal
        open={statusOpen}
        currentStatus={caseDetails.status}
        saving={isUpdating}
        onClose={() => setStatusOpen(false)}
        onApply={(status) => updateStatus.mutate({ id: caseDetails.id, status })}
      />

      <ConfirmationDialog
        open={deleteOpen}
        title="Delete case?"
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete case'}
        loading={isDeleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteCase.mutate(caseDetails.id)}
      >
        This action cannot be undone. All data associated with{' '}
        <strong className="font-semibold text-navy">{caseDetails.caseNumber}</strong>{' '}
        will be permanently removed, including hearings, documents, notes, and
        billing history.
      </ConfirmationDialog>
    </>
  )
}
