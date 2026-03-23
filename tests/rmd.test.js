import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getRMDStartAge, calcRMD, getDistributionPeriod } from '../src/rmd.js';

describe('rmd', () => {
  describe('getRMDStartAge', () => {
    it('should return correct start age by birth year', () => {
      assert.equal(getRMDStartAge(1950), 72); // 1950 and earlier
      assert.equal(getRMDStartAge(1951), 73); // 1951-1959
      assert.equal(getRMDStartAge(1959), 73); // 1951-1959
      assert.equal(getRMDStartAge(1960), 75); // 1960 and later
      assert.equal(getRMDStartAge(2000), 75); // 1960 and later
    });
  });

  describe('getDistributionPeriod', () => {
    it('should return distribution period from IRS table', () => {
      assert.equal(getDistributionPeriod(72), 27.4);
      assert.equal(getDistributionPeriod(73), 26.5);
      assert.equal(getDistributionPeriod(80), 20.2);
      assert.equal(getDistributionPeriod(90), 12.2);
    });

    it('should return 0 for age below 72', () => {
      assert.equal(getDistributionPeriod(71), 0);
      assert.equal(getDistributionPeriod(50), 0);
    });

    it('should use max age (120) for ages beyond table', () => {
      assert.equal(getDistributionPeriod(121), 2.0);
      assert.equal(getDistributionPeriod(150), 2.0);
    });
  });

  describe('calcRMD', () => {
    it('should calculate RMD for age 72 (born 1950)', () => {
      const result = calcRMD(500000, 72, 1950);
      assert.equal(result.required, true);
      assert.equal(result.startAge, 72);
      assert.equal(result.divisor, 27.4);
      assert.equal(Math.round(result.rmd), Math.round(500000 / 27.4)); // ~18248
    });

    it('should calculate RMD for age 73 (born 1955)', () => {
      const result = calcRMD(500000, 73, 1955);
      assert.equal(result.required, true);
      assert.equal(result.startAge, 73);
      assert.equal(result.divisor, 26.5);
      assert.equal(Math.round(result.rmd), Math.round(500000 / 26.5)); // ~18868
    });

    it('should not require RMD before start age', () => {
      const result = calcRMD(500000, 71, 1950);
      assert.equal(result.required, false);
      assert.equal(result.rmd, 0);
    });

    it('should not require RMD with zero balance', () => {
      const result = calcRMD(0, 75, 1950);
      assert.equal(result.required, false);
      assert.equal(result.rmd, 0);
    });

    it('should return correct RMD amounts for different balances', () => {
      const balance = 1000000;
      const result = calcRMD(balance, 80, 1950);
      assert.equal(Math.round(result.rmd), Math.round(balance / result.divisor));
    });
  });
});
