import { CalendarDays, Copy, MapPin, MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react'

import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { DropdownMenu, type DropdownMenuItem } from '@/shared/components/DropdownMenu'
import { formatShortDate } from '@/shared/lib/utils'

import { countryLabel } from '../lib/countries'
import { clientStatusLabels, clientStatusVariants } from '../lib/labels'
import type { ClientDetails } from '../types'

interface ClientHeaderProps {
  client: ClientDetails
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
  onCopy: (field: 'email' | 'phone') => void
  statusPending?: boolean
}

export function ClientHeader({
  client,
  onEdit,
  onDelete,
  onToggleStatus,
  onCopy,
  statusPending = false,
}: ClientHeaderProps) {
  const location = [client.city, countryLabel(client.country)]
    .filter(Boolean)
    .join(', ')

  const role = [client.occupation, client.companyName]
    .filter(Boolean)
    .join(' at ')

  const menuItems: DropdownMenuItem[] = [
    {
      id: 'copy-email',
      label: 'Copy email address',
      icon: Copy,
      onSelect: () => onCopy('email'),
      disabled: !client.email,
    },
    {
      id: 'copy-phone',
      label: 'Copy phone number',
      icon: Copy,
      onSelect: () => onCopy('phone'),
      disabled: !client.phone,
    },
    {
      id: 'toggle-status',
      label:
        client.status === 'ACTIVE' ? 'Mark as inactive' : 'Mark as active',
      icon: Power,
      onSelect: onToggleStatus,
      disabled: statusPending,
    },
    {
      id: 'delete',
      label: 'Delete client',
      icon: Trash2,
      tone: 'danger',
      onSelect: onDelete,
    },
  ]

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <Avatar
            name={client.fullName}
            src={client.avatarUrl}
            size="xl"
            online={client.status === 'ACTIVE'}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-2xl text-navy sm:text-3xl">
                {client.fullName}
              </h2>
              <Badge variant={clientStatusVariants[client.status]}>
                {clientStatusLabels[client.status]}
              </Badge>
            </div>

            {role ? (
              <p className="mt-1 truncate text-sm text-text-secondary">{role}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-text-secondary">
              {location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-blue" />
                  {location}
                </span>
              ) : null}
              {client.clientSince ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-blue" />
                  Client since {formatShortDate(client.clientSince)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={onEdit}>
            <Pencil className="size-4" />
            Edit Profile
          </Button>
          <Button size="sm" variant="secondary" onClick={onDelete}>
            Delete
          </Button>
          <DropdownMenu
            triggerLabel="More client actions"
            trigger={<MoreHorizontal className="size-4" />}
            items={menuItems}
          />
        </div>
      </div>
    </Card>
  )
}
