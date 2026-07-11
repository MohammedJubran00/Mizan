import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildDashboardCacheKey } from '../src/modules/dashboard/cache/dashboard-cache';

describe('buildDashboardCacheKey', () => {
  it('scopes keys by workspace', () => {
    const a = buildDashboardCacheKey('ws-a');
    const b = buildDashboardCacheKey('ws-b');
    assert.notEqual(a, b);
    assert.match(a, /^v1:dashboard:ws-a$/);
  });

  it('includes filter digest when present', () => {
    const key = buildDashboardCacheKey('ws-a', 'abc123');
    assert.equal(key, 'v1:dashboard:ws-a:abc123');
  });
});
