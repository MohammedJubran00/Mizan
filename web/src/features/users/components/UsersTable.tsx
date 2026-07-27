import {
  Ban,
  CheckCircle2,
  Eye,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { Checkbox } from '@/shared/components/Checkbox'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { Pagination } from '@/shared/components/Pagination'
import type { useRowSelection } from '@/shared/hooks/useRowSelection'
import { formatCount, formatDateTime, formatShortDate } from '@/shared/lib/utils'

import { departmentLabels, userStatusLabels, userStatusVariants } from '../lib/labels'
import type { UserListItem, UsersPagination } from '../types'

type Selection = ReturnType<typeof useRowSelection>

interface UsersTableProps {
  items: UserListItem[]
  selection: Selection
  pagination?: UsersPagination
  empty: ReactNode
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onView: (item: UserListItem) => void
  onEdit: (item: UserListItem) => void
  onSuspend: (item: UserListItem) => void
  onActivate: (item: UserListItem) => void
  onResetPassword: (item: UserListItem) => void
  onDelete: (item: UserListItem) => void
  onBulkDelete: () => void
  onBulkSuspend: () => void
  onBulkActivate: () => void
}

export function UsersTable({
  items,
  selection,
  pagination,
  empty,
  onPageChange,
  onView,
  onEdit,
  onSuspend,
  onActivate,
  onResetPassword,
  onDelete,
  onBulkDelete,
  onBulkSuspend,
  onBulkActivate,
}: UsersTableProps) {
  if (items.length === 0) return <>{empty}</>

  function buildMenu(item: UserListItem): DropdownMenuItem[] {
    return [
      {
        id: 'view',
        label: 'View profile',
        icon: Eye,
        onSelect: () => onView(item),
      },
      {
        id: 'edit',
        label: 'Edit',
        icon: Pencil,
        onSelect: () => onEdit(item),
      },
      item.status === 'SUSPENDED'
        ? {
            id: 'activate',
            label: 'Activate',
            icon: CheckCircle2,
            onSelect: () => onActivate(item),
          }
        : {
            id: 'suspend',
            label: 'Suspend',
            icon: Ban,
            disabled: item.status === 'ARCHIVED',
            onSelect: () => onSuspend(item),
          },
      {
        id: 'reset',
        label: 'Reset password',
        icon: KeyRound,
        onSelect: () => onResetPassword(item),
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        tone: 'danger',
        onSelect: () => onDelete(item),
      },
    ]
  }

  const columns: DataTableColumn<UserListItem>[] = [
    {
      id: 'select',
      header: (
        <Checkbox
          checked={selection.allSelected}
          indeterminate={selection.someSelected}
          onChange={selection.toggleAll}
          aria-label={
            selection.allSelected
              ? 'Clear selection'
              : 'Select all users on this page'
          }
        />
      ),
      className: 'w-10',
      render: (row) => (
        <div onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selection.isSelected(row.id)}
            onChange={() => selection.toggle(row.id)}
            aria-label={`Select ${row.fullName}`}
          />
        </div>
      ),
    },
    {
      id: 'user',
      header: 'User',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            name={row.fullName}
            src={row.avatarUrl ?? undefined}
            size="sm"
            online={row.online}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy">{row.fullName}</p>
            <p className="text-xs text-text-muted">
              Joined {formatShortDate(row.joinedAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      className: 'hidden md:table-cell',
      render: (row) => (
        <span className="text-text-secondary">{row.email}</span>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      render: (row) => <Badge variant="neutral">{row.roleName}</Badge>,
    },
    {
      id: 'department',
      header: 'Department',
      className: 'hidden lg:table-cell',
      render: (row) => (
        <span className="text-text-secondary">
          {departmentLabels[row.department]}
        </span>
      ),
    },
    {
      id: 'cases',
      header: 'Cases',
      className: 'hidden xl:table-cell text-right',
      render: (row) => (
        <span className="text-text-secondary">
          {formatCount(row.assignedCasesCount)}
        </span>
      ),
    },
    {
      id: 'login',
      header: 'Last login',
      className: 'hidden xl:table-cell',
      render: (row) => (
        <span className="text-text-secondary">
          {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : 'Never'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={userStatusVariants[row.status]}>
          {userStatusLabels[row.status]}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'w-12',
      render: (row) => (
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu
            triggerLabel={`Actions for ${row.fullName}`}
            trigger={<MoreHorizontal className="size-4" />}
            items={buildMenu(row)}
          />
        </div>
      ),
    },
  ]

  return (
    <Card className="overflow-hidden">
      {selection.count > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-surface-muted/40 px-4 py-3">
          <p className="mr-2 text-xs font-semibold text-navy">
            {formatCount(selection.count)} selected
          </p>
          <Button size="sm" variant="secondary" onClick={onBulkActivate}>
            Enable
          </Button>
          <Button size="sm" variant="secondary" onClick={onBulkSuspend}>
            Disable
          </Button>
          <Button size="sm" variant="danger" onClick={onBulkDelete}>
            Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={selection.clear}>
            Clear
          </Button>
        </div>
      ) : null}

      <DataTable
        caption="Firm users"
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        onRowClick={onView}
        empty={
          <div className="flex flex-col items-center py-10 text-text-muted">
            <UserRound className="size-8" />
          </div>
        }
      />

      {pagination ? (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      ) : null}
    </Card>
  )
}
