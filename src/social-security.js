/**
 * Social Security Benefit Calculations
 *
 * Calculate Primary Insurance Amount (PIA) adjustments based on claim age,
 * spousal benefits, and delayed retirement credits.
 */

/**
 * Calculate Social Security benefit based on PIA and claim age
 *
 * Applies early reduction (before FRA) or delayed credits (after FRA).
 *
 * @param {number} pia - Primary Insurance Amount (benefit at Full Retirement Age)
 * @param {number} fra - Full Retirement Age (typically 66-67)
 * @param {number} claimAge - Age when claiming benefits
 * @returns {number} Monthly benefit amount
 *
 * @example
 * const benefit = calcSSBenefit(2000, 67, 62);
 * console.log(benefit); // ~1,400 (30% reduction for claiming 5 years early)
 */
export function calcSSBenefit(pia, fra, claimAge) {
  if (claimAge === fra) return pia;

  if (claimAge < fra) {
    const monthsEarly = (fra - claimAge) * 12;
    let reduction = 0;

    // First 36 months: 5/9 of 1% per month
    // Beyond 36 months: 5/12 of 1% per month
    if (monthsEarly <= 36) {
      reduction = monthsEarly * (5 / 900);
    } else {
      reduction = 36 * (5 / 900) + (monthsEarly - 36) * (5 / 1200);
    }

    return Math.round(pia * (1 - reduction));
  }

  // Delayed credits: 8% per year beyond FRA
  const yearsLate = claimAge - fra;
  return Math.round(pia * (1 + yearsLate * 0.08));
}

/**
 * Calculate spousal benefit
 *
 * Spousal benefit is up to 50% of the higher-earning spouse's PIA,
 * reduced if claimed before FRA. If own benefit is higher, return 0.
 *
 * @param {number} spousePIA - Higher-earning spouse's Primary Insurance Amount
 * @param {number} ownPIA - Own Primary Insurance Amount
 * @param {number} ownFRA - Own Full Retirement Age
 * @param {number} claimAge - Age when claiming spousal benefit
 * @returns {number} Spousal benefit amount (0 if own benefit is higher)
 *
 * @example
 * const spousal = calcSpousalBenefit(4000, 2000, 67, 67);
 * console.log(spousal); // 0 (own benefit of $2000 > max spousal of $0)
 *
 * @example
 * const spousal = calcSpousalBenefit(4000, 1500, 67, 67);
 * console.log(spousal); // 500 (half of spouse's = $2000; own = $1500; difference = $500)
 */
export function calcSpousalBenefit(spousePIA, ownPIA, ownFRA, claimAge) {
  const maxSpousal = spousePIA * 0.5;

  if (maxSpousal <= ownPIA) return 0; // Own benefit is higher

  let spousalOnly = maxSpousal - ownPIA;

  if (claimAge < ownFRA) {
    const monthsEarly = (ownFRA - claimAge) * 12;
    const reduction = Math.min(monthsEarly * (25 / 36 / 100), 0.3);
    spousalOnly *= 1 - reduction;
  }

  return Math.max(0, Math.round(spousalOnly));
}
