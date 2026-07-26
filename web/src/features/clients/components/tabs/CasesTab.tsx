import { Briefcase } from 'lucide-react'

import { Badge } from '@/shared/components/Badge'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { SectionCard } from '@/shared/components/SectionCard'
import { formatShortDate } from '@/shared/lib/utils'

import { caseStatusLabels, caseStatusVariants } from '../../lib/labels'
import type { ClientCase } from '../../types'

const columns: DataTableColumn<ClientCase>[] = [
  {
    id: 'reference',
    header: 'Reference',
    render: (row) => (
      <span className="font-mono text-xs text-text-secondary">{row.reference}</span>
    ),
  },
  {
    id: 'title',
    header: 'Case',
    render: (row) => (
      <div className="min-w-0">
        <p className="truncate font-semibold text-navy">{row.title}</p>
        {row.practiceArea ? (
          <p className="truncate text-xs text-text-muted">{row.practiceArea}</p>
        ) : null}
      </div>
    ),
  },
  {
    id: 'lead',
    header: 'Lead',
    render: (row) => (
      <span className="text-text-secondary">{row.leadAttorneyName ?? '—'}</span>
    ),
  },
  {
    id: 'opened',
    header: 'Opened',
    render: (row) => (
      <span className="text-text-secondary">{formatShortDate(row.openedAt)}</span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={caseStatusVariants[row.status]}>
        {caseStatusLabels[row.status]}
      </Badge>
    ),
  },
]

export function CasesTab({ cases }: { cases: ClientCase[] }) {
  return (
    <SectionCard title="Cases" icon={Briefcase} bodyClassName="px-2 py-2">
      <DataTable
        caption="Cases linked to this client"
        columns={columns}
        rows={cases}
        rowKey={(row) => row.id}
        empty={
          <EmptyState
            icon={Briefcase}
            title="No cases yet"
            description="Cases linked to this client will appear here once they are created."
            className="border-0 py-10"
          />
        }
      />
    </SectionCard>
  )
}
