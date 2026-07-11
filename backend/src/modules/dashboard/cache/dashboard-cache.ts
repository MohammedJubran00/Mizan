import type { DashboardResponseDto } from '../dto';

/**
 * Cache contract for dashboard payloads.
 * Smart Cache / background refresh can plug in later without changing services.
 * Key includes optional filter digest so filtered analytics stay isolatable.
 */
export interface DashboardCache {
  get(cacheKey: string): Promise<DashboardResponseDto | null>;
  set(cacheKey: string, value: DashboardResponseDto, ttlSeconds?: number): Promise<void>;
  invalidate(workspaceId: string): Promise<void>;
}

/**
 * No-op cache used until a real store (Redis, memory, etc.) is wired.
 */
export class PassthroughDashboardCache implements DashboardCache {
  async get(_cacheKey: string): Promise<DashboardResponseDto | null> {
    return null;
  }

  async set(
    _cacheKey: string,
    _value: DashboardResponseDto,
    _ttlSeconds?: number,
  ): Promise<void> {
    // Intentionally empty — architecture placeholder for future Smart Cache.
  }

  async invalidate(_workspaceId: string): Promise<void> {
    // Intentionally empty.
  }
}

export function buildDashboardCacheKey(
  workspaceId: string,
  filterDigest?: string,
): string {
  return filterDigest ? `dashboard:${workspaceId}:${filterDigest}` : `dashboard:${workspaceId}`;
}
