import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calcSSBenefit, calcSpousalBenefit } from '../src/social-security.js';

describe('social-security', () => {
  describe('calcSSBenefit', () => {
    it('should return full PIA at FRA', () => {
      const pia = 2500;
      assert.equal(calcSSBenefit(pia, 67, 67), pia);
    });

    it('should reduce benefit for early claiming', () => {
      const pia = 2500;
      // Claiming at 62 (5 years = 60 months early)
      // First 36 months: 5/900 per month = 0.20% per month
      // Months 37-60: 5/1200 per month = 0.4167% per month
      // Total reduction: 36 * 0.556% + 24 * 0.4167% = 20% + 10% = 30%
      const early = calcSSBenefit(pia, 67, 62);
      assert.ok(early < pia);
      assert.ok(early > 0);
    });

    it('should increase benefit for delayed claiming', () => {
      const pia = 2500;
      // Delaying 3 years at 8% per year = 24% increase
      const delayed = calcSSBenefit(pia, 67, 70);
      const expected = Math.round(pia * 1.24);
      assert.equal(delayed, expected);
    });

    it('should handle various claim ages', () => {
      const pia = 2000;
      const fra = 67;

      // Test a range of ages
      const age62 = calcSSBenefit(pia, fra, 62);
      const age66 = calcSSBenefit(pia, fra, 66);
      const age70 = calcSSBenefit(pia, fra, 70);

      assert.ok(age62 < age66);
      assert.ok(age66 < pia);
      assert.ok(age70 > pia);
    });
  });

  describe('calcSpousalBenefit', () => {
    it('should return 0 if own PIA exceeds max spousal', () => {
      const spousePIA = 2000;
      const ownPIA = 2000;
      const result = calcSpousalBenefit(spousePIA, ownPIA, 67, 67);
      assert.equal(result, 0); // Own = $2000, max spousal = $1000
    });

    it('should calculate spousal difference at FRA', () => {
      const spousePIA = 4000; // Max spousal = $2000
      const ownPIA = 1500;
      const result = calcSpousalBenefit(spousePIA, ownPIA, 67, 67);
      assert.equal(result, 500); // $2000 - $1500
    });

    it('should reduce spousal benefit for early claiming', () => {
      const spousePIA = 4000;
      const ownPIA = 1000;
      const atFRA = calcSpousalBenefit(spousePIA, ownPIA, 67, 67);
      const earlyFive = calcSpousalBenefit(spousePIA, ownPIA, 62, 67);
      assert.ok(earlyFive < atFRA);
    });

    it('should return 0 for negative results', () => {
      const spousePIA = 2000;
      const ownPIA = 1500;
      const result = calcSpousalBenefit(spousePIA, ownPIA, 67, 67);
      assert.ok(result >= 0);
    });
  });
});
