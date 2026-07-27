import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computeClientPayments } from '../src/modules/clients/mapper/client-payments';

describe('computeClientPayments', () => {
  it('sums paid and outstanding invoice amounts', () => {
    const result = computeClientPayments([
      { amount: 200, currency: 'USD', status: 'SENT' },
      { amount: 150, currency: 'USD', status: 'PAID' },
      { amount: 50, currency: 'USD', status: 'OVERDUE' },
      { amount: 75, currency: 'USD', status: 'DRAFT' },
      { amount: 25, currency: 'USD', status: 'CANCELLED' },
    ]);

    assert.equal(result.totalPaid, 150);
    assert.equal(result.outstanding, 250);
    assert.equal(result.currency, 'USD');
  });

  it('returns zeros when there are no invoices', () => {
    const result = computeClientPayments([]);
    assert.deepEqual(result, { totalPaid: 0, outstanding: 0, currency: 'USD' });
  });
});
