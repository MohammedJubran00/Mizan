import type { DashboardResponseDto } from '../dto';
import type { CacheDomain } from '../../../shared/cache/smart-cache.types';
import type { SmartCache } from '../../../shared/cache/smart-cache.types';

/** Default TTL for full dashboard aggregation payloads (seconds). */
export const DASHBOARD_CACHE_TTL_SECONDS = 45;

/** Domains attached to every full dashboard cache entry. */
export const DASHBOARD_CACHE_TAGS: CacheDomain[] = [
  'dashboard',
  'overview',
  'revenue',
  'charts',
  'hearings',
  'deadlines',
  'activities',
  'alerts',
  'notifications',
  'team',
  'cases',
  'clients',
  'billing',
];

/**
 * Dashboard-facing cache adapter over the shared Smart Cache.
 * Supports TTL, workspace isolation, selective invalidation, and request coalescing.
 */
export interface DashboardCache {
  get(cacheKey: string): Promise<DashboardResponseDto | null>;
  set(
    cacheKey: string,
    value: DashboardResponseDto,
    options: { workspaceId: string; ttlSeconds?: number },
  ): Promise<void>;
  /** Coalesce concurrent identical loads. */
  getOrLoad(
    cacheKey: string,
    workspaceId: string,
    loader: () => Promise<DashboardResponseDto>,
    ttlSeconds?: number,
  ): Promise<DashboardResponseDto>;
  invalidate(workspaceId: string): Promise<void>;
  invalidateTags(workspaceId: string, tags: CacheDomain[]): Promise<number>;
}

export class SmartDashboardCache implements DashboardCache {
  constructor(private readonly smartCache: SmartCache) {}

  async get(cacheKey: string): Promise<DashboardResponseDto | null> {
    return this.smartCache.get<DashboardResponseDto>(cacheKey);
  }

  async set(
    cacheKey: string,
    value: DashboardResponseDto,
    options: { workspaceId: string; ttlSeconds?: number },
  ): Promise<void> {
    await this.smartCache.set(cacheKey, value, {
      workspaceId: options.workspaceId,
      ttlSeconds: options.ttlSeconds ?? DASHBOARD_CACHE_TTL_SECONDS,
      tags: DASHBOARD_CACHE_TAGS,
      version: this.smartCache.getVersion(options.workspaceId),
    });
  }

  async getOrLoad(
    cacheKey: string,
    workspaceId: string,
    loader: () => Promise<DashboardResponseDto>,
    ttlSeconds = DASHBOARD_CACHE_TTL_SECONDS,
  ): Promise<DashboardResponseDto> {
    return this.smartCache.getOrLoad(cacheKey, loader, {
      workspaceId,
      ttlSeconds,
      tags: DASHBOARD_CACHE_TAGS,
      version: this.smartCache.getVersion(workspaceId),
    });
  }

  async invalidate(workspaceId: string): Promise<void> {
    await this.smartCache.invalidateWorkspace(workspaceId);
  }

  async invalidateTags(workspaceId: string, tags: CacheDomain[]): Promise<number> {
    return this.smartCache.invalidateTags(workspaceId, tags);
  }
}

/**
 * @deprecated Prefer SmartDashboardCache — kept for tests / emergency bypass.
 */
export class PassthroughDashboardCache implements DashboardCache {
  async get(_cacheKey: string): Promise<DashboardResponseDto | null> {
    return null;
  }

  async set(): Promise<void> {}

  async getOrLoad(
    _cacheKey: string,
    _workspaceId: string,
    loader: () => Promise<DashboardResponseDto>,
  ): Promise<DashboardResponseDto> {
    return loader();
  }

  async invalidate(_workspaceId: string): Promise<void> {}

  async invalidateTags(): Promise<number> {
    return 0;
  }
}

export function buildDashboardCacheKey(
  workspaceId: string,
  filterDigest?: string,
): string {
  // Version-free key — workspace isolation is enforced by entry metadata.
  return filterDigest
    ? `v1:dashboard:${workspaceId}:${filterDigest}`
    : `v1:dashboard:${workspaceId}`;
}
