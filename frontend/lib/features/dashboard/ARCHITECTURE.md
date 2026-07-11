# Dashboard Frontend Architecture

## Overview

The Dashboard feature is a Clean Architecture, feature-first module. Every displayed metric comes from the backend aggregation API (`GET /api/dashboard`). The Flutter client never fabricates KPI values.

## Layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| Presentation | `presentation/` | Pages, Cubits, widgets — no business rules |
| Domain | `domain/` | Entities, repository contracts, use cases |
| Data | `data/` | DTO parsing (`DashboardModel`), remote DS, repository + Smart Cache |

## State management

`DashboardCubit` orchestrates a single fetch and fans out slices:

- `OverviewCubit` — KPI cards
- `RevenueCubit` — revenue card + analytics
- `ChartCubit` — chart datasets
- `HearingCubit` / `DeadlineCubit` / `ActivityCubit` — timeline panels

Widgets use `buildWhen` / `BlocSelector` / `RepaintBoundary` so only affected sections rebuild.

## Caching & refresh

- Repository Smart Cache TTL: **45s** (`DesignTokens.dashboardCacheTtl`) — aligned with backend
- Workspace-isolated keys; fail-closed if workspace missing
- Pull-to-refresh forces network
- Background poll (60s) uses cache when warm; silent refresh preserves activity infinite-scroll state
- Mutations call `AppDependencies.refreshDashboardAfterMutation()`

## Theme

All colors resolve via `ThemeData` + `MizanThemeExtension`. Breakpoints and spacing live in `DesignTokens`.

## Extension points

Future widgets (AI Insights, Tasks, Messaging) should:

1. Add a backend DTO section under `extensions` or a first-class field
2. Add a section Cubit
3. Register it in `DashboardCubit._distribute`
4. Render inside `DashboardHomePage` without growing a monolith Cubit

## Folder map

```
dashboard/
  data/          models, datasources, repositories, nav catalog
  domain/        entities, repositories, usecases
  presentation/  cubits, pages, widgets/, charts/
  ARCHITECTURE.md
```
