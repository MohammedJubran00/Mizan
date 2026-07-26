import { ExternalLink, MapPin, Video } from 'lucide-react'

import { Button } from '@/shared/components/Button'
import { SectionCard } from '@/shared/components/SectionCard'

import type { EventLocation } from '../types'

interface LocationCardProps {
  location: EventLocation | null
}

export function LocationCard({ location }: LocationCardProps) {
  const mapQuery = [location?.name, location?.address].filter(Boolean).join(', ')

  return (
    <SectionCard
      title="Location"
      description={location?.room ? location.room : undefined}
      icon={MapPin}
    >
      {!location || (!location.name && !location.address && !location.virtualUrl) ? (
        <p className="text-sm text-text-muted">
          No location set for this event.
        </p>
      ) : (
        <div className="space-y-3">
          {location.name ? (
            <p className="text-sm font-medium text-navy">{location.name}</p>
          ) : null}
          {location.address ? (
            <p className="text-sm text-text-secondary">{location.address}</p>
          ) : null}

          <div
            role="img"
            aria-label={
              mapQuery ? `Map preview for ${mapQuery}` : 'Map preview unavailable'
            }
            className="flex h-36 items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted"
          >
            <span className="flex flex-col items-center gap-1.5 text-text-muted">
              <MapPin className="size-6" strokeWidth={1.75} />
              <span className="text-xs font-medium">
                {mapQuery ? 'Map preview' : 'No address to preview'}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {mapQuery ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                <ExternalLink className="size-4" />
                Open in Maps
              </Button>
            ) : null}

            {location.virtualUrl ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  window.open(
                    location.virtualUrl as string,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                <Video className="size-4" />
                Join meeting
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </SectionCard>
  )
}
