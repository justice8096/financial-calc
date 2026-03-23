import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calcBracketTax } from '../src/taxes.js';

describe('taxes', () => {
  describe('calcBracketTax', () => {
    it('should calculate tax with sample brackets', () => {
      const brackets = [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: Infinity, rate: 0.22 },
      ];

      // Income below first bracket
      assert.equal(calcBracketTax(5000, brackets), 500); // 5000 * 0.10

      // Income spanning brackets
      const tax = calcBracketTax(50000, brackets);
      const expected = 11000 * 0.1 + (44725 - 11000) * 0.12 + (50000 - 44725) * 0.22;
      assert.equal(Math.round(tax * 100) / 100, Math.round(expected * 100) / 100);

      // High income
      const highIncome = 200000;
      const highTax = calcBracketTax(highIncome, brackets);
      assert.ok(highTax > 0);
      assert.ok(highTax < highIncome); // Tax is less than income
    });

    it('should handle zero income', () => {
      const brackets = [
        { min: 0, max: 10000, rate: 0.1 },
        { min: 10000, max: 50000, rate: 0.2 },
      ];
      assert.equal(calcBracketTax(0, brackets), 0);
    });

    it('should handle income exactly at bracket boundary', () => {
      const brackets = [
        { min: 0, max: 10000, rate: 0.1 },
        { min: 10000, max: 50000, rate: 0.2 },
      ];
      // Income of 10000 should be taxed at 10%, not 20%
      assert.equal(calcBracketTax(10000, brackets), 1000);
    });

    it('should handle brackets with Infinity as max', () => {
      const brackets = [
        { min: 0, max: 100, rate: 0.1 },
        { min: 100, max: Infinity, rate: 0.2 },
      ];
      const tax = calcBracketTax(150, brackets);
      const expected = 100 * 0.1 + 50 * 0.2; // 10 + 10 = 20
      assert.equal(tax, expected);
    });
  });
});
