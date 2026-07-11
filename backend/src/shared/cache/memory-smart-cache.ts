import type {
  CacheDomain,
  CacheEntryMeta,
  CacheSetOptions,
  SmartCache,
} from './smart-cache.types';

interface MemoryEntry {
  value: unknown;
  meta: CacheEntryMeta;
}

const DEFAULT_MAX_ENTRIES = 2_000;

/**
 * In-memory Smart Cache — production-ready for single-node / sticky sessions.
 * Horizontal scale: swap for Redis implementing the same [SmartCache] contract.
 *
 * Guarantees:
 * - Workspace isolation (keys + invalidation scoped by workspaceId)
 * - TTL expiration
 * - Selective tag invalidation
 * - Versioning for stale-write protection
 * - Request deduplication via getOrLoad
 * - Memory-safe eviction (LRU-ish by oldest createdAt when over max)
 */
export class MemorySmartCache implements SmartCache {
  private readonly store = new Map<string, MemoryEntry>();
  private readonly inflight = new Map<string, Promise<unknown>>();
  private readonly versions = new Map<string, number>();
  private readonly maxEntries: number;

  constructor(options?: { maxEntries?: number }) {
    this.maxEntries = options?.maxEntries ?? DEFAULT_MAX_ENTRIES;
  }

  getVersion(workspaceId: string): number {
    return this.versions.get(workspaceId) ?? 0;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() >= entry.meta.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, options: CacheSetOptions): Promise<void> {
    const now = Date.now();
    const version = options.version ?? this.getVersion(options.workspaceId);

    // Reject stale writes from older workspace versions.
    if (version < this.getVersion(options.workspaceId)) {
      return;
    }

    this.evictIfNeeded();

    this.store.set(key, {
      value,
      meta: {
        workspaceId: options.workspaceId,
        tags: [...options.tags],
        expiresAt: now + options.ttlSeconds * 1000,
        version,
        createdAt: now,
      },
    });
  }

  async invalidateWorkspace(workspaceId: string): Promise<void> {
    this.bumpVersion(workspaceId);
    for (const [key, entry] of this.store) {
      if (entry.meta.workspaceId === workspaceId) {
        this.store.delete(key);
      }
    }
  }

  async invalidateTags(workspaceId: string, tags: CacheDomain[]): Promise<number> {
    if (tags.length === 0) return 0;
    this.bumpVersion(workspaceId);
    const tagSet = new Set(tags);
    let removed = 0;
    for (const [key, entry] of this.store) {
      if (entry.meta.workspaceId !== workspaceId) continue;
      if (entry.meta.tags.some((t) => tagSet.has(t))) {
        this.store.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  async getOrLoad<T>(
    key: string,
    loader: () => Promise<T>,
    options: CacheSetOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const existing = this.inflight.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    const promise = (async () => {
      try {
        const value = await loader();
        await this.set(key, value, options);
        return value;
      } finally {
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, promise);
    return promise;
  }

  size(): number {
    return this.store.size;
  }

  async clear(): Promise<void> {
    this.store.clear();
    this.inflight.clear();
    this.versions.clear();
  }

  private bumpVersion(workspaceId: string): void {
    this.versions.set(workspaceId, this.getVersion(workspaceId) + 1);
  }

  private evictIfNeeded(): void {
    if (this.store.size < this.maxEntries) return;

    // Drop expired first.
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now >= entry.meta.expiresAt) {
        this.store.delete(key);
      }
    }

    if (this.store.size < this.maxEntries) return;

    // Evict oldest ~10% by createdAt.
    const ordered = [...this.store.entries()].sort(
      (a, b) => a[1].meta.createdAt - b[1].meta.createdAt,
    );
    const toDrop = Math.max(1, Math.floor(this.maxEntries * 0.1));
    for (let i = 0; i < toDrop && i < ordered.length; i += 1) {
      const entry = ordered[i];
      if (entry) this.store.delete(entry[0]);
    }
  }
}
