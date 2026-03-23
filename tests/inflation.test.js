import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getFxMultiplier,
  getInflationMultiplier,
  getInflationFxMultiplier,
  getAvgInflationMultiplier,
  getTypicalMonthly,
  getProjectedMonthly,
  projectCosts,
} from '../src/inflation.js';

describe('inflation', () => {
  const currentYear = 2026;
  const location = {
    currency: 'USD',
    monthlyCosts: {
      rent: { typical: 1500, annualInflation: 0.03 },
      groceries: { typical: 400, annualInflation: 0.02 },
      utilities: { typical: 150, annualInflation: 0.025 },
    },
  };

  const foreignLocation = {
    currency: 'EUR',
    monthlyCosts: {
      rent: { typical: 1200, annualInflation: 0.03 },
      groceries: { typical: 350, annualInflation: 0.02 },
    },
  };

  describe('getFxMultiplier', () => {
    it('should return 1 for USD location', () => {
      assert.equal(getFxMultiplier(location, 5, 0.02), 1);
    });

    it('should return 1 for no drift', () => {
      assert.equal(getFxMultiplier(foreignLocation, 5, 0), 1);
    });

    it('should return 1 for zero years', () => {
      assert.equal(getFxMultiplier(foreignLocation, 0, 0.02), 1);
    });

    it('should calculate drift correctly for foreign currency', () => {
      const mult = getFxMultiplier(foreignLocation, 5, 0.02);
      const expected = Math.pow(1.02, 5); // ~1.104
      assert.equal(Math.round(mult * 1000) / 1000, Math.round(expected * 1000) / 1000);
    });

    it('should handle negative drift (currency strengthening)', () => {
      const mult = getFxMultiplier(foreignLocation, 5, -0.01);
      const expected = Math.pow(0.99, 5); // ~0.951
      assert.equal(Math.round(mult * 1000) / 1000, Math.round(expected * 1000) / 1000);
    });

    it('should compound annually over multiple years', () => {
      const mult1yr = getFxMultiplier(foreignLocation, 1, 0.02); // 1.02
      const mult2yr = getFxMultiplier(foreignLocation, 2, 0.02); // 1.0404
      const mult5yr = getFxMultiplier(foreignLocation, 5, 0.02); // ~1.104
      assert.ok(mult1yr < mult2yr);
      assert.ok(mult2yr < mult5yr);
    });
  });

  describe('getInflationMultiplier', () => {
    it('should return 1 for current year', () => {
      const mult = getInflationMultiplier(location, 'rent', currentYear, currentYear);
      assert.equal(mult, 1);
    });

    it('should return 1 for past year', () => {
      const mult = getInflationMultiplier(location, 'rent', 2020, currentYear);
      assert.equal(mult, 1);
    });

    it('should use default inflation (2.5%) for unknown category', () => {
      const mult = getInflationMultiplier(location, 'unknown', 2027, currentYear);
      const expected = Math.pow(1.025, 1);
      assert.equal(Math.round(mult * 1000) / 1000, Math.round(expected * 1000) / 1000);
    });

    it('should use category-specific inflation rate', () => {
      const mult = getInflationMultiplier(location, 'rent', 2027, currentYear);
      const expected = Math.pow(1.03, 1); // 3% for rent
      assert.equal(Math.round(mult * 1000) / 1000, Math.round(expected * 1000) / 1000);
    });

    it('should compound inflation over multiple years', () => {
      const mult1yr = getInflationMultiplier(location, 'rent', 2027, currentYear); // 1.03
      const mult4yr = getInflationMultiplier(location, 'rent', 2030, currentYear); // ~1.126
      assert.ok(mult1yr < mult4yr);
      const expected = Math.pow(1.03, 4);
      assert.equal(
        Math.round(mult4yr * 1000) / 1000,
        Math.round(expected * 1000) / 1000,
      );
    });
  });

  describe('getInflationFxMultiplier', () => {
    it('should combine inflation and FX drift', () => {
      const combined = getInflationFxMultiplier(foreignLocation, 'rent', 2031, 0.02, currentYear);
      const inflMult = Math.pow(1.03, 5); // 5 years at 3%
      const fxMult = Math.pow(1.02, 5); // 5 years at 2%
      const expected = inflMult * fxMult;
      assert.equal(Math.round(combined * 1000) / 1000, Math.round(expected * 1000) / 1000);
    });

    it('should handle zero years', () => {
      const mult = getInflationFxMultiplier(foreignLocation, 'rent', currentYear, 0.02, currentYear);
      assert.equal(mult, 1);
    });

    it('should apply only inflation for USD location', () => {
      const mult = getInflationFxMultiplier(location, 'rent', 2031, 0.02, currentYear);
      const inflMult = Math.pow(1.03, 5);
      assert.equal(Math.round(mult * 1000) / 1000, Math.round(inflMult * 1000) / 1000);
    });
  });

  describe('getAvgInflationMultiplier', () => {
    it('should return 1 for current year', () => {
      const mult = getAvgInflationMultiplier(location, currentYear, currentYear);
      assert.equal(mult, 1);
    });

    it('should average inflation rates across categories', () => {
      // Average of 3%, 2%, 2.5% = 2.5%
      const mult = getAvgInflationMultiplier(location, 2027, currentYear);
      const expected = Math.pow(1.025, 1);
      assert.equal(Math.round(mult * 1000) / 1000, Math.round(expected * 1000) / 1000);
    });

    it('should use default (2.5%) for empty categories', () => {
      const emptyLoc = { monthlyCosts: {} };
      const mult = getAvgInflationMultiplier(emptyLoc, 2027, currentYear);
      const expected = Math.pow(1.025, 1);
      assert.equal(Math.round(mult * 1000) / 1000, Math.round(expected * 1000) / 1000);
    });

    it('should compound average inflation over multiple years', () => {
      const mult = getAvgInflationMultiplier(location, 2030, currentYear);
      // 4 years of ~2.5% average
      const expected = Math.pow(1.025, 4);
      assert.ok(
        Math.abs(mult - expected) < 0.01, // Allow 1% tolerance for rounding
      );
    });
  });

  describe('getTypicalMonthly', () => {
    it('should sum all monthly costs', () => {
      const monthly = getTypicalMonthly(location);
      const expected = 1500 + 400 + 150; // rent + groceries + utilities
      assert.equal(monthly, expected);
    });

    it('should return 0 for empty categories', () => {
      const emptyLoc = { monthlyCosts: {} };
      assert.equal(getTypicalMonthly(emptyLoc), 0);
    });

    it('should only sum categories with typical field', () => {
      const partialLoc = {
        monthlyCosts: {
          rent: { typical: 1000 },
          groceries: { annualInflation: 0.02 }, // No typical value
          utilities: { typical: 100 },
        },
      };
      assert.equal(getTypicalMonthly(partialLoc), 1100);
    });
  });

  describe('getProjectedMonthly', () => {
    it('should return current monthly for same year', () => {
      const projected = getProjectedMonthly(location, currentYear, 0.02, currentYear);
      const expected = getTypicalMonthly(location);
      assert.equal(projected, expected);
    });

    it('should apply inflation without FX for USD', () => {
      const projected = getProjectedMonthly(location, 2027, 0.02, currentYear);
      const typical = getTypicalMonthly(location);
      // Each category inflates separately
      const rent2027 = 1500 * 1.03;
      const groceries2027 = 400 * 1.02;
      const utilities2027 = 150 * 1.025;
      const expected = rent2027 + groceries2027 + utilities2027;
      assert.equal(Math.round(projected * 100) / 100, Math.round(expected * 100) / 100);
    });

    it('should apply both inflation and FX drift for foreign currency', () => {
      const projected = getProjectedMonthly(foreignLocation, 2031, 0.02, currentYear);
      // Each category: inflate, then apply FX
      const rent2031 = 1200 * Math.pow(1.03, 5) * Math.pow(1.02, 5);
      const groceries2031 = 350 * Math.pow(1.02, 5) * Math.pow(1.02, 5);
      const expected = rent2031 + groceries2031;
      assert.equal(Math.round(projected * 100) / 100, Math.round(expected * 100) / 100);
    });

    it('should return current monthly for past year', () => {
      const projected = getProjectedMonthly(location, 2020, 0.02, currentYear);
      const expected = getTypicalMonthly(location);
      assert.equal(projected, expected);
    });
  });

  describe('projectCosts', () => {
    it('should return correct number of years', () => {
      const rows = projectCosts(location, 2026, 5, 0, currentYear);
      assert.equal(rows.length, 5);
    });

    it('should include years 2026-2030', () => {
      const rows = projectCosts(location, 2026, 5, 0, currentYear);
      assert.equal(rows[0].year, 2026);
      assert.equal(rows[1].year, 2027);
      assert.equal(rows[4].year, 2030);
    });

    it('should calculate correct annual costs', () => {
      const rows = projectCosts(location, 2026, 1, 0, currentYear);
      const row = rows[0];
      const expectedMonthly = getTypicalMonthly(location);
      const expectedAnnual = expectedMonthly * 12;
      assert.equal(Math.round(row.annual * 100) / 100, Math.round(expectedAnnual * 100) / 100);
    });

    it('should have cumulative totals increasing', () => {
      const rows = projectCosts(location, 2026, 3, 0, currentYear);
      assert.equal(rows[0].cumulative, rows[0].annual);
      assert.ok(rows[1].cumulative > rows[0].cumulative);
      assert.ok(rows[2].cumulative > rows[1].cumulative);
    });

    it('should apply FX multiplier each year', () => {
      const rows = projectCosts(foreignLocation, 2026, 3, 0.02, currentYear);
      assert.equal(rows[0].fxMultiplier, 1); // Year 0: no drift
      assert.equal(
        Math.round(rows[1].fxMultiplier * 1000) / 1000,
        Math.round(Math.pow(1.02, 1) * 1000) / 1000,
      );
      assert.equal(
        Math.round(rows[2].fxMultiplier * 1000) / 1000,
        Math.round(Math.pow(1.02, 2) * 1000) / 1000,
      );
    });

    it('should include all categories in output', () => {
      const rows = projectCosts(location, 2026, 1, 0, currentYear);
      const row = rows[0];
      assert.ok('rent' in row);
      assert.ok('groceries' in row);
      assert.ok('utilities' in row);
      assert.ok('total' in row);
      assert.ok('annual' in row);
      assert.ok('fxMultiplier' in row);
      assert.ok('cumulative' in row);
    });

    it('should apply inflation within projection', () => {
      const rows = projectCosts(location, 2026, 2, 0, currentYear);
      const year0Rent = rows[0].rent;
      const year1Rent = rows[1].rent;
      // Year 1 should be year 0 inflated by 3%
      const expected = year0Rent * 1.03;
      assert.equal(
        Math.round(year1Rent * 100) / 100,
        Math.round(expected * 100) / 100,
      );
    });

    it('should handle negative FX drift', () => {
      const rows = projectCosts(foreignLocation, 2026, 2, -0.01, currentYear);
      assert.equal(rows[0].fxMultiplier, 1);
      assert.equal(
        Math.round(rows[1].fxMultiplier * 1000) / 1000,
        Math.round(Math.pow(0.99, 1) * 1000) / 1000,
      );
    });

    it('should calculate total correctly (sum of categories)', () => {
      const rows = projectCosts(location, 2026, 1, 0, currentYear);
      const row = rows[0];
      const expectedTotal = row.rent + row.groceries + row.utilities;
      assert.equal(Math.round(row.total * 100) / 100, Math.round(expectedTotal * 100) / 100);
    });
  });
});
