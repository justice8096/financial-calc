/**
 * Inflation and Currency Drift Calculations
 *
 * Utilities for projecting costs forward with inflation and foreign exchange drift.
 */

/**
 * Get FX drift multiplier for a foreign-currency location
 *
 * @param {object} location - Location object with currency field
 * @param {number} yearsOut - Number of years in the future
 * @param {number} fxDrift - Annual FX drift rate (positive = USD weakens)
 * @returns {number} Multiplier (1.0 for USD or no drift)
 *
 * @example
 * const mult = getFxMultiplier(loc, 5, 0.02); // 1.104 (2% annual USD weakness)
 */
export function getFxMultiplier(loc, yearsOut, fxDrift) {
  if (!fxDrift || !loc || loc.currency === 'USD') return 1;
  return Math.pow(1 + fxDrift, yearsOut);
}

/**
 * Get inflation multiplier for a specific category and target year
 *
 * @param {object} location - Location object with monthlyCosts
 * @param {string} category - Cost category (e.g., 'rent', 'groceries')
 * @param {number} targetYear - Target year (compared to CURRENT_YEAR)
 * @returns {number} Inflation multiplier
 *
 * @example
 * const mult = getInflationMultiplier(loc, 'healthcare', 2030); // 1.105 (5% annual over 4 years)
 */
export function getInflationMultiplier(loc, category, targetYear, currentYear) {
  if (!targetYear || targetYear <= currentYear) return 1;
  const years = targetYear - currentYear;
  let infl = 0.025; // default 2.5%
  if (loc && loc.monthlyCosts && loc.monthlyCosts[category]) {
    infl = loc.monthlyCosts[category].annualInflation || 0.025;
  }
  return Math.pow(1 + infl, years);
}

/**
 * Combined inflation + FX drift multiplier for a single category
 *
 * @param {object} location - Location with monthlyCosts
 * @param {string} category - Cost category
 * @param {number} targetYear - Target year
 * @param {number} fxDrift - Annual FX drift rate
 * @returns {number} Combined multiplier
 */
export function getInflationFxMultiplier(loc, category, targetYear, fxDrift, currentYear) {
  const inflMult = getInflationMultiplier(loc, category, targetYear, currentYear);
  const years = !targetYear || targetYear <= currentYear ? 0 : targetYear - currentYear;
  const fxMult = getFxMultiplier(loc, years, fxDrift);
  return inflMult * fxMult;
}

/**
 * Average inflation multiplier across all cost categories
 *
 * @param {object} location - Location with monthlyCosts
 * @param {number} targetYear - Target year
 * @returns {number} Average inflation multiplier
 */
export function getAvgInflationMultiplier(loc, targetYear, currentYear) {
  if (!targetYear || targetYear <= currentYear) return 1;
  const years = targetYear - currentYear;
  const rates = [];
  if (loc && loc.monthlyCosts) {
    Object.keys(loc.monthlyCosts).forEach(function (cat) {
      const r = loc.monthlyCosts[cat].annualInflation;
      if (r) rates.push(r);
    });
  }
  const avg = rates.length > 0 ? rates.reduce((s, r) => s + r, 0) / rates.length : 0.025;
  return Math.pow(1 + avg, years);
}

/**
 * Get typical monthly cost for a location (sum of all categories)
 *
 * @param {object} location - Location with monthlyCosts
 * @returns {number} Total monthly cost
 */
export function getTypicalMonthly(loc) {
  return Object.values(loc.monthlyCosts).reduce((sum, cat) => sum + (cat.typical || 0), 0);
}

/**
 * Project total monthly cost to a target year
 *
 * @param {object} location - Location with monthlyCosts
 * @param {number} targetYear - Target year
 * @param {number} fxDrift - Annual FX drift rate (optional)
 * @returns {number} Projected monthly cost
 */
export function getProjectedMonthly(loc, targetYear, fxDrift, currentYear) {
  if (!targetYear || targetYear <= currentYear) return getTypicalMonthly(loc);
  const years = targetYear - currentYear;
  let total = 0;
  Object.keys(loc.monthlyCosts).forEach(function (cat) {
    const base = loc.monthlyCosts[cat].typical || 0;
    total += base * getInflationMultiplier(loc, cat, targetYear, currentYear);
  });
  return total * getFxMultiplier(loc, years, fxDrift);
}

/**
 * Full year-by-year cost projection
 *
 * @param {object} location - Location with monthlyCosts
 * @param {number} startYear - Starting year
 * @param {number} years - Number of years to project
 * @param {number} fxDrift - Annual FX drift (optional)
 * @returns {Array} Array of yearly projection objects
 *
 * @example
 * const rows = projectCosts(loc, 2026, 10, 0.01);
 * rows.forEach(row => console.log(`${row.year}: $${row.annual}`));
 */
export function projectCosts(loc, startYear, years, fxDrift, currentYear) {
  const categories = Object.keys(loc.monthlyCosts);
  const rows = [];
  let cumulative = 0;

  for (let y = 0; y < years; y++) {
    const row = { year: startYear + y };
    let total = 0;
    const fxMult = getFxMultiplier(loc, y, fxDrift);

    categories.forEach(function (cat) {
      const base = loc.monthlyCosts[cat].typical;
      const infl = loc.monthlyCosts[cat].annualInflation || 0.025;
      const projected = base * Math.pow(1 + infl, y) * fxMult;
      row[cat] = projected;
      total += projected;
    });

    row.total = total;
    row.annual = total * 12;
    row.fxMultiplier = fxMult;
    cumulative += row.annual;
    row.cumulative = cumulative;
    rows.push(row);
  }

  return rows;
}
