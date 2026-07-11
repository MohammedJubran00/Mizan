import type { DashboardResponseDto } from '../dto';

/**
 * Cache contract for dashboard payloads.
 * Smart Cache / background refresh can plug in later without changing services.
 */
export interface DashboardCache {
  get(workspaceId: string): Promise<DashboardResponseDto | null>;
  set(workspaceId: string, value: DashboardResponseDto, ttlSeconds?: number): Promise<void>;
  invalidate(workspaceId: string): Promise<void>;
}

/**
 * No-op cache used until a real store (Redis, memory, etc.) is wired.
 */
export class PassthroughDashboardCache implements DashboardCache {
  async get(_workspaceId: string): Promise<DashboardResponseDto | null> {
    return null;
  }

  async set(
    _workspaceId: string,
    _value: DashboardResponseDto,
    _ttlSeconds?: number,
  ): Promise<void> {
    // Intentionally empty — architecture placeholder for future Smart Cache.
  }

  async invalidate(_workspaceId: string): Promise<void> {
    // Intentionally empty.
  }
}
