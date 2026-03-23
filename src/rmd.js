/**
 * Required Minimum Distribution (RMD) Calculations
 *
 * Based on IRS Uniform Lifetime Table (Table III), effective 2022+
 * Per SECURE 2.0 Act:
 *   - Born 1951-1959: RMDs start at age 73
 *   - Born 1960+: RMDs start at age 75
 */

// IRS Uniform Lifetime Table III — distribution period (divisor) by age
const UNIFORM_TABLE = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9,
  78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7,
  84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9,
  90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9,
  96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4, 101: 6.0,
  102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1,
  108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1,
  114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3,
  120: 2.0,
};

/**
 * Get RMD start age based on birth year
 *
 * @param {number} birthYear - Year of birth
 * @returns {number} Age when RMDs begin (72, 73, or 75)
 */
export function getRMDStartAge(birthYear) {
  if (birthYear <= 1950) return 72;
  if (birthYear <= 1959) return 73;
  return 75;
}

/**
 * Get distribution period (divisor) for a given age
 *
 * @param {number} age - Current age
 * @returns {number} Distribution period from IRS table
 */
export function getDistributionPeriod(age) {
  if (age < 72) return 0;
  if (age > 120) return UNIFORM_TABLE[120];
  return UNIFORM_TABLE[age] || 0;
}

/**
 * Calculate RMD for an individual
 *
 * @param {number} priorYearBalance - Account balance at prior year-end
 * @param {number} age - Current age
 * @param {number} birthYear - Birth year
 * @returns {object} {rmd, divisor, required, startAge}
 *
 * @example
 * const rmd = calcRMD(500000, 72, 1950);
 * console.log(`Must withdraw: $${rmd.rmd}`); // ~$18,250
 */
export function calcRMD(priorYearBalance, age, birthYear) {
  const startAge = getRMDStartAge(birthYear);
  if (age < startAge || priorYearBalance <= 0) {
    return { rmd: 0, divisor: 0, required: false, startAge };
  }
  const divisor = getDistributionPeriod(age);
  if (divisor <= 0) {
    return { rmd: 0, divisor: 0, required: false, startAge };
  }
  const rmd = priorYearBalance / divisor;
  return { rmd, divisor, required: true, startAge };
}

/**
 * Calculate RMD for a couple (uses older spouse's age)
 *
 * @param {number} priorYearBalance - Account balance at prior year-end
 * @param {number} hAge - Husband's age
 * @param {number} wAge - Wife's age
 * @param {number} hBirthYear - Husband's birth year
 * @param {number} wBirthYear - Wife's birth year
 * @param {boolean} hAlive - Husband alive
 * @param {boolean} wAlive - Wife alive
 * @returns {object} {rmd, divisor, required, startAge, rmdAge}
 */
export function calcCoupleRMD(priorYearBalance, hAge, wAge, hBirthYear, wBirthYear, hAlive, wAlive) {
  if (priorYearBalance <= 0) {
    return { rmd: 0, divisor: 0, required: false, startAge: 0, rmdAge: 0 };
  }

  let age, birthYear;
  if (hAlive && wAlive) {
    if (hAge >= wAge) {
      age = hAge;
      birthYear = hBirthYear;
    } else {
      age = wAge;
      birthYear = wBirthYear;
    }
  } else if (hAlive) {
    age = hAge;
    birthYear = hBirthYear;
  } else if (wAlive) {
    age = wAge;
    birthYear = wBirthYear;
  } else {
    return { rmd: 0, divisor: 0, required: false, startAge: 0, rmdAge: 0 };
  }

  const result = calcRMD(priorYearBalance, age, birthYear);
  result.rmdAge = age;
  return result;
}

/**
 * RMD penalty rate for missed or shortfall withdrawals
 * Updated to 25% under SECURE 2.0 (was 50%)
 */
export const RMD_PENALTY_RATE = 0.25;

/**
 * Reduced penalty rate if corrected within 2 years
 */
export const RMD_PENALTY_RATE_CORRECTED = 0.10;
