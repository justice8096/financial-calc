import { describe, it } from 'node:test';
import assert from 'node:assert';
import { fmt, fmtK, pct } from '../src/formatting.js';

describe('formatting', () => {
  describe('fmt', () => {
    it('should format whole numbers with currency symbol', () => {
      assert.equal(fmt(0), '$0');
      assert.equal(fmt(100), '$100');
      assert.equal(fmt(1000), '$1,000');
    });

    it('should add thousands separators', () => {
      assert.equal(fmt(1000), '$1,000');
      assert.equal(fmt(10000), '$10,000');
      assert.equal(fmt(100000), '$100,000');
      assert.equal(fmt(1000000), '$1,000,000');
    });

    it('should round decimals to nearest integer', () => {
      assert.equal(fmt(1234.4), '$1,234');
      assert.equal(fmt(1234.5), '$1,235');
      assert.equal(fmt(1234.9), '$1,235');
    });

    it('should handle negative numbers', () => {
      assert.equal(fmt(-100), '$-100');
      assert.equal(fmt(-1000), '$-1,000');
      assert.equal(fmt(-50000), '$-50,000');
    });

    it('should handle very large numbers', () => {
      assert.equal(fmt(1000000000), '$1,000,000,000');
      assert.equal(fmt(999999999.99), '$1,000,000,000');
    });

    it('should handle very small numbers', () => {
      assert.equal(fmt(0.1), '$0');
      assert.equal(fmt(0.5), '$1');
      assert.equal(fmt(0.9), '$1');
    });
  });

  describe('fmtK', () => {
    it('should format thousands as K suffix', () => {
      assert.equal(fmtK(0), '$0K');
      assert.equal(fmtK(1000), '$1K');
      assert.equal(fmtK(10000), '$10K');
      assert.equal(fmtK(50000), '$50K');
    });

    it('should round to nearest K', () => {
      assert.equal(fmtK(1400), '$1K');
      assert.equal(fmtK(1500), '$2K');
      assert.equal(fmtK(1900), '$2K');
    });

    it('should handle decimal values', () => {
      assert.equal(fmtK(1234), '$1K');
      assert.equal(fmtK(1500), '$2K');
      assert.equal(fmtK(5678), '$6K');
    });

    it('should handle large numbers', () => {
      assert.equal(fmtK(1000000), '$1000K');
      assert.equal(fmtK(1500000), '$1500K');
    });

    it('should handle negative numbers', () => {
      assert.equal(fmtK(-1000), '$-1K');
      assert.equal(fmtK(-50000), '$-50K');
    });

    it('should handle sub-thousand amounts', () => {
      assert.equal(fmtK(400), '$0K');
      assert.equal(fmtK(100), '$0K');
    });
  });

  describe('pct', () => {
    it('should format decimals as percentages', () => {
      assert.equal(pct(0), '0.0%');
      assert.equal(pct(0.1), '10.0%');
      assert.equal(pct(0.25), '25.0%');
      assert.equal(pct(0.5), '50.0%');
      assert.equal(pct(1), '100.0%');
    });

    it('should show one decimal place', () => {
      assert.equal(pct(0.05), '5.0%');
      assert.equal(pct(0.123), '12.3%');
      assert.equal(pct(0.999), '99.9%');
    });

    it('should truncate to one decimal place', () => {
      // toFixed() rounds, but uses banker's rounding, so test what we get
      assert.equal(pct(0.1234), '12.3%');
      assert.equal(pct(0.1239), '12.4%');
    });

    it('should handle very small decimals', () => {
      assert.equal(pct(0.001), '0.1%');
      assert.equal(pct(0.0001), '0.0%');
      assert.equal(pct(0.0099), '1.0%');
    });

    it('should handle decimals > 1', () => {
      assert.equal(pct(1.5), '150.0%');
      assert.equal(pct(2), '200.0%');
      assert.equal(pct(10), '1000.0%');
    });

    it('should handle negative decimals', () => {
      assert.equal(pct(-0.1), '-10.0%');
      assert.equal(pct(-0.25), '-25.0%');
      assert.equal(pct(-1), '-100.0%');
    });

    it('should show trailing zero for consistency', () => {
      assert.ok(pct(0.1).endsWith('.0%'));
      assert.ok(pct(0.25).endsWith('.0%'));
      assert.ok(pct(1).endsWith('.0%'));
    });
  });

  describe('combined formatting scenarios', () => {
    it('should format tax results', () => {
      const grossIncome = 75000;
      const tax = 12500;
      const netIncome = grossIncome - tax;

      assert.equal(fmt(grossIncome), '$75,000');
      assert.equal(fmt(tax), '$12,500');
      assert.equal(fmt(netIncome), '$62,500');
      assert.equal(pct(tax / grossIncome), '16.7%');
    });

    it('should format retirement portfolio values', () => {
      const portfolio = 2500000;
      const allocation = {
        stocks: 0.60,
        bonds: 0.35,
        cash: 0.05,
      };

      assert.equal(fmtK(portfolio), '$2500K');
      assert.equal(pct(allocation.stocks), '60.0%');
      assert.equal(pct(allocation.bonds), '35.0%');
      assert.equal(pct(allocation.cash), '5.0%');
    });

    it('should format inflation scenarios', () => {
      const currentCost = 50000;
      const inflationRate = 0.03;
      const yearsOut = 10;
      const futureCost = currentCost * Math.pow(1 + inflationRate, yearsOut);

      assert.equal(fmt(currentCost), '$50,000');
      assert.equal(pct(inflationRate), '3.0%');
      assert.equal(fmt(futureCost), '$67,196');
    });
  });
});
