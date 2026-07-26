import { MessageSquare, Phone, Scale } from 'lucide-react'

import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { SectionCard } from '@/shared/components/SectionCard'

import type { CasePersonRef } from '../types'

interface LawyerCardProps {
  lawyer: CasePersonRef | null
  team: CasePersonRef[]
}

export function LawyerCard({ lawyer, team }: LawyerCardProps) {
  return (
    <SectionCard title="Lead Counsel" icon={Scale}>
      {lawyer ? (
        <div className="space-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={lawyer.fullName} src={lawyer.avatarUrl} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">
                {lawyer.fullName}
              </p>
              {lawyer.subtitle ? (
                <p className="truncate text-xs text-text-muted">{lawyer.subtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              disabled={!lawyer.email}
              onClick={() => {
                if (lawyer.email) window.location.href = `mailto:${lawyer.email}`
              }}
            >
              <MessageSquare className="size-4" />
              Message
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              disabled={!lawyer.phone}
              onClick={() => {
                if (lawyer.phone) window.location.href = `tel:${lawyer.phone}`
              }}
            >
              <Phone className="size-4" />
              Call
            </Button>
          </div>

          {team.length > 0 ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Internal team
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {team.map((member) => (
                  <li key={member.id}>
                    <Badge variant="neutral">{member.fullName}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          No lead counsel has been assigned to this matter yet.
        </p>
      )}
    </SectionCard>
  )
}
