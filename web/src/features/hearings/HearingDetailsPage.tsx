import { AlertCircle, ArrowLeft, CalendarPlus, Gavel } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { TopBar } from '@/app/layout/TopBar'
import { Breadcrumbs } from '@/shared/components/Breadcrumbs'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { TabPanel, Tabs, type TabItem } from '@/shared/components/Tabs'
import { toast } from '@/stores/toastStore'

import { HearingContextCards } from './components/HearingContextCards'
import { HearingHeader } from './components/HearingHeader'
import { HearingDetailsSkeleton } from './components/HearingSkeletons'
import { OutcomeModal } from './components/OutcomeModal'
import { RescheduleModal } from './components/RescheduleModal'
import {
  DocumentsTab,
  NotesTab,
  TimelineTab,
} from './components/tabs/DetailTabs'
import { OverviewTab } from './components/tabs/OverviewTab'
import { useHearingDetails, useHearingMutations } from './hooks/useHearingQueries'
import { hearingTypeLabels } from './lib/labels'
import type { HearingListItem } from './types'

const TAB_IDS = ['overview', 'timeline', 'documents', 'notes'] as const
type TabId = (typeof TAB_IDS)[number]

function isTabId(value: string | null): value is TabId {
  return value !== null && (TAB_IDS as readonly string[]).includes(value)
}

export function HearingDetailsPage() {
  const { hearingId } = useParams<{ hearingId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { hearing, state, refetch } = useHearingDetails(hearingId)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [outcomeOpen, setOutcomeOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)

  const { deleteHearing, updateOutcome, rescheduleHearing, isDeleting, isUpdating } =
    useHearingMutations({
      onDeleted: () => navigate('/hearings', { replace: true }),
      onOutcomeUpdated: () => setOutcomeOpen(false),
      onRescheduled: () => setRescheduleOpen(false),
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

  const listItem = useMemo<HearingListItem | null>(() => {
    if (!hearing) return null
    return {
      id: hearing.id,
      type: hearing.type,
      status: hearing.status,
      scheduledAt: hearing.scheduledAt,
      durationMinutes: hearing.durationMinutes,
      court: hearing.court,
      room: hearing.room,
      judgeName: hearing.judgeName,
      caseRef: hearing.caseRef,
      client: hearing.client,
      leadLawyer: hearing.leadLawyer,
      createdAt: hearing.createdAt,
      updatedAt: hearing.updatedAt,
    }
  }, [hearing])

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied', 'Share this hearing with your team.')
    } catch {
      toast.error('Could not copy link', 'Clipboard access was denied.')
    }
  }

  if (state === 'loading') {
    return (
      <>
        <TopBar title="Hearing" subtitle="Loading…" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <HearingDetailsSkeleton />
        </div>
      </>
    )
  }

  if (state === 'error') {
    return (
      <>
        <TopBar title="Hearing" subtitle="Hearing details" />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <EmptyState
            icon={AlertCircle}
            title="Could not load hearing"
            description="Something went wrong while loading this hearing."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => refetch()}>
                  Retry
                </Button>
                <Button variant="ghost" onClick={() => navigate('/hearings')}>
                  <ArrowLeft className="size-4" />
                  Back to hearings
                </Button>
              </div>
            }
          />
        </div>
      </>
    )
  }

  if (state === 'empty' || hearing === null) {
    return (
      <>
        <TopBar title="Hearings" subtitle="Hearing details" />
        <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: 'Hearings', to: '/hearings' }, { label: 'Details' }]}
          />
          <EmptyState
            icon={Gavel}
            title="No hearing selected."
            description="Select a hearing from the list or calendar, or schedule a new appearance."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => navigate('/hearings/new')}>
                  <CalendarPlus className="size-4" />
                  Schedule Hearing
                </Button>
                <Button variant="secondary" onClick={() => navigate('/hearings')}>
                  Browse hearings
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
    { id: 'timeline', label: 'Timeline' },
    {
      id: 'documents',
      label: 'Documents',
      count: hearing.documents.length,
    },
    { id: 'notes', label: 'Notes', count: hearing.notesList.length },
  ]

  return (
    <>
      <TopBar
        title={hearingTypeLabels[hearing.type]}
        subtitle={hearing.caseRef?.title ?? 'Hearing details'}
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: 'Hearings', to: '/hearings' },
              {
                label: hearing.caseRef?.caseNumber ?? hearingTypeLabels[hearing.type],
              },
            ]}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/hearings')}
            className="sm:hidden"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <HearingHeader
          hearing={hearing}
          onEdit={() => navigate(`/hearings/${hearing.id}/edit`)}
          onShare={share}
          onPrint={() => window.print()}
          onReschedule={() => setRescheduleOpen(true)}
          onUpdateOutcome={() => setOutcomeOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />

        <HearingContextCards hearing={hearing} />

        <Card className="px-2 pt-1">
          <Tabs
            idPrefix="hearing"
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            className="border-b-0"
          />
        </Card>

        <TabPanel idPrefix="hearing" id="overview" active={activeTab === 'overview'}>
          <OverviewTab
            hearing={hearing}
            onEdit={() => navigate(`/hearings/${hearing.id}/edit`)}
            onRecordOutcome={() => setOutcomeOpen(true)}
          />
        </TabPanel>

        <TabPanel idPrefix="hearing" id="timeline" active={activeTab === 'timeline'}>
          <TimelineTab events={hearing.timeline} />
        </TabPanel>

        <TabPanel
          idPrefix="hearing"
          id="documents"
          active={activeTab === 'documents'}
        >
          <DocumentsTab documents={hearing.documents} />
        </TabPanel>

        <TabPanel idPrefix="hearing" id="notes" active={activeTab === 'notes'}>
          <NotesTab notes={hearing.notesList} />
        </TabPanel>
      </div>

      <ConfirmationDialog
        open={deleteOpen}
        title="Delete Hearing?"
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete Permanently'}
        loading={isDeleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteHearing.mutate(hearing.id)}
      >
        This action cannot be undone. All associated notes and transcripts for this
        session will be permanently archived.
      </ConfirmationDialog>

      <OutcomeModal
        open={outcomeOpen}
        hearing={listItem}
        saving={isUpdating}
        onClose={() => setOutcomeOpen(false)}
        onSave={(payload) => updateOutcome.mutate({ id: hearing.id, payload })}
      />

      <RescheduleModal
        open={rescheduleOpen}
        hearing={listItem}
        saving={isUpdating}
        onClose={() => setRescheduleOpen(false)}
        onSave={(payload) =>
          rescheduleHearing.mutate({ id: hearing.id, payload })
        }
      />
    </>
  )
}
