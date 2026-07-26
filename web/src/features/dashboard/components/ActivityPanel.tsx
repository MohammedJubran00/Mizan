import type { ActivitiesDashboardDto } from '@/features/dashboard/types'
import { Button } from '@/shared/components/Button'

interface ActivityPanelProps {
  activities: ActivitiesDashboardDto
  loadingMore?: boolean
  onLoadMore?: () => void
}

export function ActivityPanel({
  activities,
  loadingMore,
  onLoadMore,
}: ActivityPanelProps) {
  const groups =
    activities.groups.length > 0
      ? activities.groups
      : [
          {
            key: 'ALL',
            label: 'Recent',
            items: activities.items,
          },
        ]

  const hasItems = groups.some((group) => group.items.length > 0)

  return (
    <section className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_1px_2px_rgba(26,46,90,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-navy">Recent activity</h3>
          <p className="mt-1 text-xs text-text-muted">
            {activities.total} events in this workspace
          </p>
        </div>
      </div>

      {!hasItems ? (
        <p className="py-8 text-center text-sm text-text-muted">
          No recent activity yet.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) =>
            group.items.length === 0 ? null : (
              <div key={group.key}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  {group.label}
                </p>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0"
                    >
                      <div
                        className="mt-1 size-2.5 shrink-0 rounded-full"
                        style={{ background: item.color || '#2F5BEA' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text">
                          {item.title}
                        </p>
                        {item.description ? (
                          <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
                            {item.description}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-text-muted">
                          {[item.actor?.fullName, item.relativeTime]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      )}

      {activities.pagination.hasMore && onLoadMore ? (
        <div className="mt-5 flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            loading={loadingMore}
            onClick={onLoadMore}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </section>
  )
}
