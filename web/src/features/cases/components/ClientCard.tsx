import { Mail, Phone, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Avatar } from '@/shared/components/Avatar'
import { Button } from '@/shared/components/Button'
import { SectionCard } from '@/shared/components/SectionCard'

import type { CasePersonRef } from '../types'

interface ClientCardProps {
  client: CasePersonRef | null
}

export function ClientCard({ client }: ClientCardProps) {
  const navigate = useNavigate()

  return (
    <SectionCard title="Primary Client" icon={UserRound}>
      {client ? (
        <div className="space-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={client.fullName} src={client.avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">
                {client.fullName}
              </p>
              {client.subtitle ? (
                <p className="truncate text-xs text-text-muted">{client.subtitle}</p>
              ) : null}
            </div>
          </div>

          <dl className="space-y-2 text-xs">
            {client.email ? (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Email</dt>
                <Mail className="size-3.5 shrink-0 text-blue" />
                <dd className="min-w-0">
                  <a
                    href={`mailto:${client.email}`}
                    className="block truncate text-blue transition hover:underline"
                  >
                    {client.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {client.phone ? (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Phone</dt>
                <Phone className="size-3.5 shrink-0 text-blue" />
                <dd className="min-w-0">
                  <a
                    href={`tel:${client.phone}`}
                    className="block truncate text-blue transition hover:underline"
                  >
                    {client.phone}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>

          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            View Client Profile
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">
            No client is linked to this matter yet.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => navigate('/clients')}
          >
            Browse clients
          </Button>
        </div>
      )}
    </SectionCard>
  )
}
