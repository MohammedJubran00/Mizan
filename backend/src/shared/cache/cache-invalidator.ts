import type { CacheDomain } from './smart-cache.types';
import { MUTATION_DOMAIN_MAP } from './smart-cache.types';
import type { SmartCache } from './smart-cache.types';
import { createLogger } from '../observability/logger';

const log = createLogger('cache-invalidator');

/**
 * Selective cache invalidation for workspace-scoped Smart Cache entries.
 * Call from mutation services — never clears the entire store.
 */
export class CacheInvalidator {
  constructor(private readonly cache: SmartCache) {}

  async invalidateWorkspace(workspaceId: string): Promise<void> {
    await this.cache.invalidateWorkspace(workspaceId);
    log.info('workspace_cache_invalidated', { workspaceId });
  }

  async invalidateDomains(
    workspaceId: string,
    domains: CacheDomain[],
  ): Promise<number> {
    const unique = [...new Set(domains)];
    const removed = await this.cache.invalidateTags(workspaceId, unique);
    log.info('selective_cache_invalidated', {
      workspaceId,
      domains: unique,
      removed,
    });
    return removed;
  }

  /**
   * Invalidate based on an activity / mutation type string.
   * Falls back to activities + dashboard if type is unknown.
   */
  async invalidateForMutation(
    workspaceId: string,
    mutationType: string,
  ): Promise<number> {
    const domains =
      MUTATION_DOMAIN_MAP[mutationType] ??
      (['activities', 'dashboard'] as CacheDomain[]);
    return this.invalidateDomains(workspaceId, domains);
  }
}
