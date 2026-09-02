import { describe, expect, it } from 'vitest';

import { feeFor, fromBaseUnits, toBaseUnits } from '../lib/amounts.js';
import { beneficiaryRef, isValidRef, refsMatch } from '../lib/beneficiary.js';

describe('amounts', () => {
  it('converts display amounts to base units', () => {
    expect(toBaseUnits('3')).toBe('30000000');
    expect(toBaseUnits('3.00')).toBe('30000000');
    expect(toBaseUnits('0.0000001')).toBe('1');
  });

  it('round-trips', () => {
    expect(fromBaseUnits(toBaseUnits('12.3456789'))).toBe('12.3456789');
  });

  it('truncates beyond seven decimals rather than rounding up', () => {
    expect(toBaseUnits('1.99999999')).toBe('19999999');
  });

  it('rejects malformed input', () => {
    expect(() => toBaseUnits('abc')).toThrow();
    expect(() => toBaseUnits('')).toThrow();
  });

  it('computes basis-point fees exactly as the contract does', () => {
    // 1% of 3.00 USDC is 0.03 USDC.
    expect(feeFor('30000000', 100)).toBe('300000');
    // Integer division truncates, which favours the provider.
    expect(feeFor('1', 100)).toBe('0');
  });
});

describe('beneficiary references', () => {
  const KEY = 'k'.repeat(32);

  it('is deterministic for the same identifier', () => {
    expect(beneficiaryRef('patient-001', KEY)).toBe(beneficiaryRef('patient-001', KEY));
  });

  it('is case and whitespace insensitive', () => {
    expect(beneficiaryRef('  Patient-001 ', KEY)).toBe(beneficiaryRef('patient-001', KEY));
  });

  it('differs across identifiers and across keys', () => {
    expect(beneficiaryRef('a', KEY)).not.toBe(beneficiaryRef('b', KEY));
    expect(beneficiaryRef('a', KEY)).not.toBe(beneficiaryRef('a', 'j'.repeat(32)));
  });

  it('produces a 64-character hex reference', () => {
    expect(isValidRef(beneficiaryRef('patient-001', KEY))).toBe(true);
  });

  it('refuses a weak key', () => {
    expect(() => beneficiaryRef('patient-001', 'short')).toThrow();
  });

  it('compares references safely', () => {
    const a = beneficiaryRef('patient-001', KEY);
    expect(refsMatch(a, a)).toBe(true);
    expect(refsMatch(a, beneficiaryRef('patient-002', KEY))).toBe(false);
  });
});
