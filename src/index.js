/**
 * Financial Calculation Library
 *
 * Utilities for retirement planning, tax calculations, inflation projections,
 * and Social Security benefit estimates.
 */

export { calcBracketTax, calcTaxesForLocation } from './taxes.js';
export {
  getFxMultiplier,
  getInflationMultiplier,
  getInflationFxMultiplier,
  getAvgInflationMultiplier,
  getTypicalMonthly,
  getProjectedMonthly,
  projectCosts,
} from './inflation.js';
export {
  getRMDStartAge,
  getDistributionPeriod,
  calcRMD,
  calcCoupleRMD,
  RMD_PENALTY_RATE,
  RMD_PENALTY_RATE_CORRECTED,
} from './rmd.js';
export { calcSSBenefit, calcSpousalBenefit } from './social-security.js';
export { fmt, fmtK, pct } from './formatting.js';
