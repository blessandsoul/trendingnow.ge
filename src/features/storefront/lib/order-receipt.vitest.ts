import { beforeEach, describe, expect, it } from 'vitest';

import { hasOrderReceipt, rememberOrderReceipt } from './order-receipt';

describe('order receipt gate', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('accepts only the code saved after the create-order response', () => {
    expect(hasOrderReceipt('TN-unknown')).toBe(false);
    rememberOrderReceipt('TN-real');
    expect(hasOrderReceipt('TN-real')).toBe(true);
    expect(hasOrderReceipt('TN-other')).toBe(false);
  });

  it('fails closed when the session value is malformed', () => {
    window.sessionStorage.setItem('trendingnow.order-receipt', '{bad-json');
    expect(hasOrderReceipt('TN-other')).toBe(false);
  });
});
