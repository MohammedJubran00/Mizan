import { Eye, MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react'
import type { ReactNode } from 'react'

import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { Card } from '@/shared/components/Card'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { DropdownMenu } from '@/shared/components/DropdownMenu'
import { formatCount, formatMoney } from '@/shared/lib/utils'

import { clientStatusLabels, clientStatusVariants } from '../lib/labels'
import type { Client } from '../types'

interface ClientListTableProps {
  clients: Client[]
  empty: ReactNode
  onOpen: (client: Client) => void
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export function ClientListTable({
  clients,
  empty,
  onOpen,
  onEdit,
  onDelete,
}: ClientListTableProps) {
  const columns: DataTableColumn<Client>[] = [
    {
      id: 'client',
      header: 'Client',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={row.fullName} size="md" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">{row.fullName}</p>
            {row.companyName ? (
              <p className="truncate text-xs text-text-muted">{row.companyName}</p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      render: (row) => (
        <div className="min-w-0 text-xs text-text-secondary">
          <p className="truncate">{row.email}</p>
          <p className="truncate">{row.phone}</p>
        </div>
      ),
    },
    {
      id: 'tags',
      header: 'Tags',
      render: (row) =>
        row.tags.length === 0 ? (
          <span className="text-xs text-text-muted">—</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {row.tags.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="info">
                {tag.label}
              </Badge>
            ))}
            {row.tags.length > 2 ? (
              <Badge variant="neutral">+{row.tags.length - 2}</Badge>
            ) : null}
          </span>
        ),
    },
    {
      id: 'cases',
      header: 'Active cases',
      className: 'text-right',
      render: (row) => (
        <span className="font-semibold text-navy">
          {formatCount(row.stats.activeCases)}
        </span>
      ),
    },
    {
      id: 'outstanding',
      header: 'Outstanding',
      className: 'text-right',
      render: (row) => (
        <span
          className={
            row.payments.outstanding > 0
              ? 'font-semibold text-danger'
              : 'text-text-secondary'
          }
        >
          {formatMoney(row.payments.outstanding, row.payments.currency)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={clientStatusVariants[row.status]}>
          {clientStatusLabels[row.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'w-16 text-right',
      render: (row) => (
        <div
          className="flex justify-end"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenu
            triggerLabel={`Actions for ${row.fullName}`}
            trigger={<MoreHorizontal className="size-4" />}
            items={[
              {
                id: 'view',
                label: 'View profile',
                icon: Eye,
                onSelect: () => onOpen(row),
              },
              {
                id: 'edit',
                label: 'Edit client',
                icon: Pencil,
                onSelect: () => onEdit(row),
              },
              {
                id: 'delete',
                label: 'Delete client',
                icon: Trash2,
                tone: 'danger',
                onSelect: () => onDelete(row),
              },
            ]}
          />
        </div>
      ),
    },
  ]

  if (clients.length === 0) return <>{empty}</>

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <Users className="size-4 text-blue" strokeWidth={1.75} />
        <h2 className="text-sm font-semibold text-navy">
          {formatCount(clients.length)}{' '}
          {clients.length === 1 ? 'client' : 'clients'}
        </h2>
      </div>
      <DataTable
        caption="Client directory"
        columns={columns}
        rows={clients}
        rowKey={(row) => row.id}
        onRowClick={onOpen}
        empty={null}
      />
    </Card>
  )
}
