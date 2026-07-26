import { Users } from 'lucide-react'

import { Avatar } from '@/shared/components/Avatar'
import { Badge } from '@/shared/components/Badge'
import { SectionCard } from '@/shared/components/SectionCard'

import {
  participantResponseLabels,
  participantResponseVariants,
} from '../lib/labels'
import type { EventParticipant } from '../types'

interface ParticipantListProps {
  participants: EventParticipant[]
}

export function ParticipantList({ participants }: ParticipantListProps) {
  return (
    <SectionCard
      title="Participants"
      description={
        participants.length > 0
          ? `${participants.length} invited`
          : 'Nobody invited yet'
      }
      icon={Users}
      bodyClassName="px-2 py-2"
    >
      {participants.length === 0 ? (
        <p className="px-2 py-3 text-sm text-text-muted">
          No participants have been added to this event.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {participants.map((participant) => (
            <li
              key={participant.id}
              className="flex items-center gap-3 px-2 py-2.5"
            >
              <Avatar name={participant.fullName} src={participant.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy">
                  {participant.fullName}
                  {participant.external ? (
                    <span className="ml-1.5 text-xs font-normal text-text-muted">
                      external
                    </span>
                  ) : null}
                </p>
                {participant.email ? (
                  <a
                    href={`mailto:${participant.email}`}
                    className="block truncate text-xs text-blue transition hover:underline"
                  >
                    {participant.email}
                  </a>
                ) : participant.subtitle ? (
                  <p className="truncate text-xs text-text-muted">
                    {participant.subtitle}
                  </p>
                ) : null}
              </div>
              <Badge variant={participantResponseVariants[participant.response]}>
                {participantResponseLabels[participant.response]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
