/**
 * Financial Calculation Library - TypeScript Declarations
 *
 * Zero-dependency utilities for retirement planning: taxes, inflation,
 * Social Security, RMD, and formatting.
 */

// ============================================================================
// TAXES MODULE
// ============================================================================

/**
 * Bracket-based tax calculation (generic, works with any tax system)
 */
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

/**
 * Calculate tax using a bracket system
 *
 * @param income - Taxable income
 * @param brackets - Array of bracket objects with {min, max, rate}
 * @returns Total tax amount
 *
 * @example
 * const brackets = [
 *   { min: 0, max: 11000, rate: 0.10 },
 *   { min: 11000, max: 44725, rate: 0.12 },
 *   { min: 44725, max: Infinity, rate: 0.22 }
 * ];
 * const tax = calcBracketTax(50000, brackets); // 5525
 */
export function calcBracketTax(income: number, brackets: TaxBracket[]): number;

/**
 * Tax configuration for a location
 */
export interface LocationTaxConfig {
  taxes?: {
    federalIncomeTax?: {
      standardDeduction?: number;
      foreignTaxCredit?: boolean;
    };
    stateIncomeTax?: {
      brackets?: TaxBracket[];
      deduction?: number;
      label?: string;
      exemptions?: string;
    };
    ssExempt?: boolean;
    ssTaxedInCountry?: boolean;
    retirementExempt?: boolean;
    socialCharges?: {
      rate: number;
      name?: string;
      basis: string;
      annualThreshold?: number;
    };
    estVehicleTax?: number;
  };
}

/**
 * Tax calculation result
 */
export interface TaxBreakdown {
  federal: number;
  state: number;
  socialCharges: number;
  vehicleTax: number;
  total: number;
  totalIncome: number;
  effectiveRate: number;
  details: Array<{
    label: string;
    amount: number;
    note: string;
  }>;
}

/**
 * Calculate US federal and state income taxes for a location
 *
 * @param location - Location object with tax configuration
 * @param ssIncome - Social Security income
 * @param iraIncome - IRA/qualified retirement income
 * @param investIncome - Investment/capital gains income
 * @returns Tax breakdown with federal, state, and total amounts
 *
 * @example
 * const location = {
 *   taxes: {
 *     federalIncomeTax: { standardDeduction: 27700 },
 *     stateIncomeTax: { brackets: [...], deduction: 0 }
 *   }
 * };
 * const result = calcTaxesForLocation(location, 30000, 50000, 20000);
 */
export function calcTaxesForLocation(
  location: LocationTaxConfig,
  ssIncome: number,
  iraIncome: number,
  investIncome: number,
): TaxBreakdown | null;

// ============================================================================
// INFLATION MODULE
// ============================================================================

/**
 * Cost category configuration
 */
export interface CostCategory {
  typical: number;
  annualInflation?: number;
}

/**
 * Location configuration with cost categories
 */
export interface LocationConfig {
  currency?: string;
  monthlyCosts?: {
    [category: string]: CostCategory;
  };
}

/**
 * Get FX drift multiplier for a foreign-currency location
 *
 * @param location - Location object with currency field
 * @param yearsOut - Number of years in the future
 * @param fxDrift - Annual FX drift rate (positive = base currency weakens)
 * @returns Multiplier (1.0 for USD or no drift)
 *
 * @example
 * const mult = getFxMultiplier(loc, 5, 0.02); // 1.104 (2% annual)
 */
export function getFxMultiplier(
  location: LocationConfig,
  yearsOut: number,
  fxDrift: number,
): number;

/**
 * Get inflation multiplier for a specific category and target year
 *
 * @param location - Location object with monthlyCosts
 * @param category - Cost category (e.g., 'rent', 'groceries')
 * @param targetYear - Target year
 * @param currentYear - Current year (default 2026)
 * @returns Inflation multiplier
 *
 * @example
 * const mult = getInflationMultiplier(loc, 'healthcare', 2030, 2026); // 1.216
 */
export function getInflationMultiplier(
  location: LocationConfig,
  category: string,
  targetYear: number,
  currentYear: number,
): number;

/**
 * Combined inflation + FX drift multiplier for a single category
 *
 * @param location - Location with monthlyCosts
 * @param category - Cost category
 * @param targetYear - Target year
 * @param fxDrift - Annual FX drift rate
 * @param currentYear - Current year
 * @returns Combined multiplier
 */
export function getInflationFxMultiplier(
  location: LocationConfig,
  category: string,
  targetYear: number,
  fxDrift: number,
  currentYear: number,
): number;

/**
 * Average inflation multiplier across all cost categories
 *
 * @param location - Location with monthlyCosts
 * @param targetYear - Target year
 * @param currentYear - Current year
 * @returns Average inflation multiplier
 */
export function getAvgInflationMultiplier(
  location: LocationConfig,
  targetYear: number,
  currentYear: number,
): number;

/**
 * Get typical monthly cost for a location (sum of all categories)
 *
 * @param location - Location with monthlyCosts
 * @returns Total monthly cost
 */
export function getTypicalMonthly(location: LocationConfig): number;

/**
 * Project total monthly cost to a target year
 *
 * @param location - Location with monthlyCosts
 * @param targetYear - Target year
 * @param fxDrift - Annual FX drift rate (optional)
 * @param currentYear - Current year
 * @returns Projected monthly cost
 */
export function getProjectedMonthly(
  location: LocationConfig,
  targetYear: number,
  fxDrift: number,
  currentYear: number,
): number;

/**
 * Yearly cost projection row
 */
export interface YearlyCostProjection {
  year: number;
  [category: string]: number | string;
  total: number;
  annual: number;
  fxMultiplier: number;
  cumulative: number;
}

/**
 * Full year-by-year cost projection
 *
 * @param location - Location with monthlyCosts
 * @param startYear - Starting year
 * @param years - Number of years to project
 * @param fxDrift - Annual FX drift (optional)
 * @param currentYear - Current year
 * @returns Array of yearly projection objects
 *
 * @example
 * const rows = projectCosts(loc, 2026, 10, 0.01, 2026);
 * rows.forEach(row => console.log(`${row.year}: $${row.annual}`));
 */
export function projectCosts(
  location: LocationConfig,
  startYear: number,
  years: number,
  fxDrift: number,
  currentYear: number,
): YearlyCostProjection[];

// ============================================================================
// RMD MODULE (Retirement-specific)
// ============================================================================

/**
 * Get RMD start age based on birth year
 *
 * Per SECURE 2.0 Act:
 *   - Born ≤1950: RMDs start at 72
 *   - Born 1951-1959: RMDs start at 73
 *   - Born 1960+: RMDs start at 75
 *
 * @param birthYear - Year of birth
 * @returns Age when RMDs begin
 */
export function getRMDStartAge(birthYear: number): number;

/**
 * Get distribution period (divisor) for a given age from IRS Uniform Lifetime Table
 *
 * @param age - Current age
 * @returns Distribution period divisor
 */
export function getDistributionPeriod(age: number): number;

/**
 * Individual RMD calculation result
 */
export interface RMDResult {
  rmd: number;
  divisor: number;
  required: boolean;
  startAge: number;
}

/**
 * Calculate RMD for an individual
 *
 * @param priorYearBalance - Account balance at prior year-end
 * @param age - Current age
 * @param birthYear - Birth year
 * @returns RMD calculation with required flag
 *
 * @example
 * const rmd = calcRMD(500000, 72, 1950);
 * console.log(`Must withdraw: $${rmd.rmd}`); // ~18248
 */
export function calcRMD(
  priorYearBalance: number,
  age: number,
  birthYear: number,
): RMDResult;

/**
 * Couple RMD calculation result
 */
export interface CoupleRMDResult extends RMDResult {
  rmdAge: number;
}

/**
 * Calculate RMD for a couple (uses older spouse's age)
 *
 * @param priorYearBalance - Account balance at prior year-end
 * @param hAge - Husband's age
 * @param wAge - Wife's age
 * @param hBirthYear - Husband's birth year
 * @param wBirthYear - Wife's birth year
 * @param hAlive - Husband alive
 * @param wAlive - Wife alive
 * @returns RMD calculation using older spouse
 */
export function calcCoupleRMD(
  priorYearBalance: number,
  hAge: number,
  wAge: number,
  hBirthYear: number,
  wBirthYear: number,
  hAlive: boolean,
  wAlive: boolean,
): CoupleRMDResult;

/**
 * RMD penalty rate for missed or shortfall withdrawals
 * Updated to 25% under SECURE 2.0 (was 50%)
 */
export const RMD_PENALTY_RATE: 0.25;

/**
 * Reduced penalty rate if corrected within 2 years
 */
export const RMD_PENALTY_RATE_CORRECTED: 0.1;

// ============================================================================
// SOCIAL SECURITY MODULE (Retirement-specific)
// ============================================================================

/**
 * Calculate Social Security benefit based on PIA and claim age
 *
 * Applies early reduction (before FRA) or delayed credits (after FRA).
 *
 * @param pia - Primary Insurance Amount (benefit at Full Retirement Age)
 * @param fra - Full Retirement Age (typically 66-67)
 * @param claimAge - Age when claiming benefits
 * @returns Monthly benefit amount
 *
 * @example
 * const benefit = calcSSBenefit(2000, 67, 62);
 * console.log(benefit); // ~1400 (30% reduction for claiming 5 years early)
 */
export function calcSSBenefit(pia: number, fra: number, claimAge: number): number;

/**
 * Calculate spousal benefit
 *
 * Spousal benefit is up to 50% of the higher-earning spouse's PIA,
 * reduced if claimed before FRA. If own benefit is higher, returns 0.
 *
 * @param spousePIA - Higher-earning spouse's Primary Insurance Amount
 * @param ownPIA - Own Primary Insurance Amount
 * @param ownFRA - Own Full Retirement Age
 * @param claimAge - Age when claiming spousal benefit
 * @returns Spousal benefit amount (0 if own benefit is higher)
 *
 * @example
 * const spousal = calcSpousalBenefit(4000, 1500, 67, 67);
 * console.log(spousal); // 500 (half of spouse's = $2000; own = $1500; difference = $500)
 */
export function calcSpousalBenefit(
  spousePIA: number,
  ownPIA: number,
  ownFRA: number,
  claimAge: number,
): number;

// ============================================================================
// FORMATTING MODULE
// ============================================================================

/**
 * Format a number as currency (dollars)
 *
 * @param n - Amount
 * @returns Formatted string (e.g., "$50,000")
 */
export function fmt(n: number): string;

/**
 * Format a number as currency in thousands (K)
 *
 * @param n - Amount
 * @returns Formatted string (e.g., "$50K")
 */
export function fmtK(n: number): string;

/**
 * Format a decimal as percentage
 *
 * @param n - Decimal (e.g., 0.25 for 25%)
 * @returns Formatted string (e.g., "25.0%")
 */
export function pct(n: number): string;
