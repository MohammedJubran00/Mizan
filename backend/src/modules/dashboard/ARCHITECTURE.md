# Dashboard Backend Architecture

## Overview

The Dashboard Aggregation API (`GET /api/dashboard`) is the single entry point for dashboard widgets. It is workspace-scoped, authenticated, and fully data-driven (Prisma aggregations — no hardcoded KPIs).

## Request path

```
authenticate → DashboardController (ETag / Cache-Control)
  → DashboardService (Smart Cache + request coalescing)
    → DashboardAggregator
      → Statistics (cases, clients, revenue, team)
      → Timeline (hearings, deadlines, activities, alerts, notifications)
    → DashboardMapper → DashboardResponseDto
```

## Multi-tenant isolation

- `authenticate` middleware validates JWT + workspace membership (`X-Workspace-Id`)
- Every repository query filters by `workspaceId`
- Cache keys are prefixed with workspace id; invalidation is workspace-scoped

## Smart Cache

| Concern | Behavior |
|---------|----------|
| Store | In-memory `MemorySmartCache` (swap for Redis via `SmartCache` interface) |
| TTL | **45 seconds** (`DASHBOARD_CACHE_TTL_SECONDS`) |
| Tags | Selective invalidation by domain (`revenue`, `hearings`, …) |
| Dedup | `getOrLoad` coalesces concurrent identical loads |
| Versioning | Workspace version bumps on invalidation; stale writes rejected |

Mutations (Activity Engine, Billing) call `CacheInvalidator.invalidateForMutation`.

## Security notes

- Team member emails are **redacted** in the dashboard aggregation response
- Activity `metadata` is **not** exposed on the dashboard timeline by default
- Responses set `Vary: Authorization, X-Workspace-Id`
- Gzip compression enabled at app level

## Extension points

Add future widgets without new dashboard endpoints:

1. Extend `DashboardResponseDto` (prefer typed fields over `extensions`)
2. Add a statistics / timeline service
3. Wire into `DashboardAggregator` / `DashboardStatisticsService`
4. Tag cache domains for selective invalidation

## Live vs removed

Unwired legacy statistics facades were removed in Epic 6 Task 8. Timeline engines (`HearingEngine`, `DeadlineEngine`, `ActivityTimeline`) are the source of truth for those widgets.
