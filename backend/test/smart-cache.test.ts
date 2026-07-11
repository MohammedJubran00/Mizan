/**
 * Unit tests for MemorySmartCache — workspace isolation, TTL, selective invalidation, dedupe.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { MemorySmartCache } from '../src/shared/cache/memory-smart-cache';
import { CacheInvalidator } from '../src/shared/cache/cache-invalidator';

describe('MemorySmartCache', () => {
  it('isolates workspaces', async () => {
    const cache = new MemorySmartCache();
    await cache.set('dashboard:a', { n: 1 }, {
      workspaceId: 'ws-a',
      ttlSeconds: 60,
      tags: ['dashboard'],
    });
    await cache.set('dashboard:b', { n: 2 }, {
      workspaceId: 'ws-b',
      ttlSeconds: 60,
      tags: ['dashboard'],
    });

    await cache.invalidateWorkspace('ws-a');
    assert.equal(await cache.get('dashboard:a'), null);
    assert.deepEqual(await cache.get('dashboard:b'), { n: 2 });
  });

  it('expires by TTL', async () => {
    const cache = new MemorySmartCache();
    await cache.set('k', 'v', {
      workspaceId: 'ws',
      ttlSeconds: 0,
      tags: ['dashboard'],
    });
    // Force expire by setting expiresAt in the past via 0 TTL (now + 0).
    await new Promise((r) => setTimeout(r, 5));
    assert.equal(await cache.get('k'), null);
  });

  it('selectively invalidates by tag', async () => {
    const cache = new MemorySmartCache();
    await cache.set('rev', 1, {
      workspaceId: 'ws',
      ttlSeconds: 60,
      tags: ['revenue', 'dashboard'],
    });
    await cache.set('hear', 2, {
      workspaceId: 'ws',
      ttlSeconds: 60,
      tags: ['hearings', 'dashboard'],
    });

    const removed = await cache.invalidateTags('ws', ['revenue']);
    assert.equal(removed, 1);
    assert.equal(await cache.get('rev'), null);
    assert.equal(await cache.get('hear'), 2);
  });

  it('deduplicates concurrent getOrLoad', async () => {
    const cache = new MemorySmartCache();
    let loads = 0;
    const loader = async () => {
      loads += 1;
      await new Promise((r) => setTimeout(r, 20));
      return { ok: true };
    };

    const [a, b] = await Promise.all([
      cache.getOrLoad('same', loader, {
        workspaceId: 'ws',
        ttlSeconds: 60,
        tags: ['dashboard'],
      }),
      cache.getOrLoad('same', loader, {
        workspaceId: 'ws',
        ttlSeconds: 60,
        tags: ['dashboard'],
      }),
    ]);

    assert.deepEqual(a, b);
    assert.equal(loads, 1);
  });

  it('invalidates via mutation map', async () => {
    const cache = new MemorySmartCache();
    const invalidator = new CacheInvalidator(cache);
    await cache.set('dash', { x: 1 }, {
      workspaceId: 'ws',
      ttlSeconds: 60,
      tags: ['revenue', 'billing', 'dashboard'],
    });
    await invalidator.invalidateForMutation('ws', 'REVENUE_ADDED');
    assert.equal(await cache.get('dash'), null);
  });
});
