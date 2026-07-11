/**
 * Cache domain tags for selective invalidation.
 * Mutating a domain only drops entries tagged with that domain.
 */
export type CacheDomain =
  | 'dashboard'
  | 'overview'
  | 'revenue'
  | 'charts'
  | 'hearings'
  | 'deadlines'
  | 'activities'
  | 'alerts'
  | 'notifications'
  | 'team'
  | 'cases'
  | 'clients'
  | 'billing'
  | 'invoices'
  | 'users'
  | 'documents';

/** Maps activity / mutation types → cache domains to invalidate. */
export const MUTATION_DOMAIN_MAP: Record<string, CacheDomain[]> = {
  CASE_CREATED: ['cases', 'overview', 'charts', 'activities', 'dashboard'],
  CASE_UPDATED: ['cases', 'overview', 'charts', 'activities', 'dashboard'],
  CASE_CLOSED: ['cases', 'overview', 'charts', 'activities', 'dashboard'],
  CASE_ASSIGNED: ['cases', 'team', 'activities', 'dashboard'],
  CLIENT_ADDED: ['clients', 'overview', 'activities', 'dashboard'],
  CLIENT_UPDATED: ['clients', 'overview', 'activities', 'dashboard'],
  INVOICE_CREATED: ['invoices', 'billing', 'revenue', 'charts', 'activities', 'dashboard'],
  INVOICE_PAID: ['invoices', 'billing', 'revenue', 'charts', 'overview', 'activities', 'dashboard'],
  REVENUE_ADDED: ['billing', 'revenue', 'charts', 'overview', 'activities', 'dashboard'],
  HEARING_SCHEDULED: ['hearings', 'alerts', 'notifications', 'overview', 'activities', 'dashboard'],
  HEARING_UPDATED: ['hearings', 'alerts', 'notifications', 'overview', 'activities', 'dashboard'],
  DEADLINE_UPDATED: ['deadlines', 'alerts', 'notifications', 'overview', 'activities', 'dashboard'],
  DOCUMENT_UPLOADED: ['documents', 'activities', 'dashboard'],
  DOCUMENT_DELETED: ['documents', 'activities', 'dashboard'],
  USER_CREATED: ['users', 'team', 'overview', 'activities', 'dashboard'],
  USER_UPDATED: ['users', 'team', 'activities', 'dashboard'],
  ROLE_CHANGED: ['users', 'team', 'activities', 'dashboard'],
  WORKSPACE_UPDATED: ['dashboard', 'overview', 'team'],
};

export interface CacheSetOptions {
  ttlSeconds: number;
  workspaceId: string;
  tags: CacheDomain[];
  /** Optional version — bumped on invalidation for race safety. */
  version?: number;
}

export interface CacheEntryMeta {
  workspaceId: string;
  tags: CacheDomain[];
  expiresAt: number;
  version: number;
  createdAt: number;
}

/**
 * Reusable Smart Cache contract — workspace-isolated, TTL, tags, versioning.
 * Designed so Redis / distributed stores can replace the in-memory impl later.
 */
export interface SmartCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options: CacheSetOptions): Promise<void>;
  /** Drop every entry for a workspace. */
  invalidateWorkspace(workspaceId: string): Promise<void>;
  /** Drop only entries matching any of the given tags within a workspace. */
  invalidateTags(workspaceId: string, tags: CacheDomain[]): Promise<number>;
  /** Current workspace cache version (increments on any invalidation). */
  getVersion(workspaceId: string): number;
  /** In-flight request coalescing — one loader shared by concurrent callers. */
  getOrLoad<T>(
    key: string,
    loader: () => Promise<T>,
    options: CacheSetOptions,
  ): Promise<T>;
  /** Approximate entry count (observability / tests). */
  size(): number;
  clear(): Promise<void>;
}
