# Financial Calculation Library

ESM-based utilities for retirement planning calculations: taxes, inflation, RMD, Social Security benefits, and formatting.

## Installation

```bash
npm install @justice8096/financial-calc
```

## Modules

### Taxes (`src/taxes.js`)

Calculate federal and state income taxes with bracket-based systems.

```javascript
import { calcBracketTax, calcTaxesForLocation } from '@justice8096/financial-calc/taxes';

// Generic bracket calculation
const brackets = [
  { min: 0, max: 11000, rate: 0.10 },
  { min: 11000, max: 44725, rate: 0.12 },
  { min: 44725, max: Infinity, rate: 0.22 },
];
const tax = calcBracketTax(50000, brackets); // $5,525

// US-specific multi-location taxes
const location = {
  taxes: {
    federalIncomeTax: { standardDeduction: 27700 },
    stateIncomeTax: { brackets: [...], deduction: 0 },
    ssExempt: false,
  },
};
const result = calcTaxesForLocation(location, 30000, 50000, 20000);
// { federal: 7500, state: 1200, total: 8700, details: [...] }
```

### Inflation (`src/inflation.js`)

Project costs with inflation and currency drift.

```javascript
import {
  getInflationMultiplier,
  getFxMultiplier,
  getProjectedMonthly,
  projectCosts,
} from '@justice8096/financial-calc/inflation';

const currentYear = 2026;
const loc = {
  currency: 'EUR',
  monthlyCosts: {
    rent: { typical: 1500, annualInflation: 0.03 },
    groceries: { typical: 400, annualInflation: 0.02 },
  },
};

// Inflation for healthcare expenses in 4 years (5% annual)
const mult = getInflationMultiplier(loc, 'healthcare', 2030, currentYear);
// 1.216 (5% compounded over 4 years)

// FX drift (EUR strengthens 2% annually)
const fxMult = getFxMultiplier(loc, 5, 0.02); // 1.104

// Projected monthly cost in 2030
const monthly2030 = getProjectedMonthly(loc, 2030, 0.02, currentYear); // $1,986

// Year-by-year breakdown
const rows = projectCosts(loc, 2026, 10, 0.02, currentYear);
rows.forEach((row) => {
  console.log(`${row.year}: $${row.annual.toLocaleString()}`);
});
```

### RMD (`src/rmd.js`)

Calculate Required Minimum Distributions (US retirement accounts).

```javascript
import {
  getRMDStartAge,
  calcRMD,
  calcCoupleRMD,
  RMD_PENALTY_RATE,
} from '@justice8096/financial-calc/rmd';

// Individual RMD
const rmd = calcRMD(500000, 73, 1950);
// { rmd: 18868, divisor: 26.5, required: true, startAge: 73 }

// Couple RMD (uses older spouse's age)
const coupleRmd = calcCoupleRMD(
  1000000,
  75, 73, // ages
  1950, 1952, // birth years
  true, true // both alive
);
// { rmd: 45249, divisor: 22.1, required: true, startAge: 73, rmdAge: 75 }

// Penalty for missed RMD (25% under SECURE 2.0)
const missedRmd = 20000;
const penalty = missedRmd * RMD_PENALTY_RATE; // $5,000
```

### Social Security (`src/social-security.js`)

Calculate benefits based on claiming age and spousal benefits.

```javascript
import { calcSSBenefit, calcSpousalBenefit } from '@justice8096/financial-calc/social-security';

const pia = 2500; // Primary Insurance Amount at Full Retirement Age (67)

// Claim at 62 (5 years early): 30% reduction
const earlyBenefit = calcSSBenefit(pia, 67, 62); // $1,750

// Claim at 70 (3 years delayed): 8% increase per year
const delayedBenefit = calcSSBenefit(pia, 67, 70); // $3,100

// Spousal benefit (50% of spouse's PIA, capped by own PIA)
const spousal = calcSpousalBenefit(
  5000, // spouse's PIA
  2500, // own PIA
  67, // own FRA
  67 // claim age
);
// $500 (max spousal $2500 - own benefit $2500 = $0... but this example would be $500 if own PIA was less)
```

### Formatting (`src/formatting.js`)

Format numbers for display.

```javascript
import { fmt, fmtK, pct } from '@justice8096/financial-calc/formatting';

fmt(50000); // "$50,000"
fmtK(50000); // "$50K"
pct(0.25); // "25.0%"
```

## API Reference

### calcBracketTax(income, brackets)

Calculate tax using a bracket system.

**Parameters:**
- `income` (number) - Taxable income
- `brackets` (array) - Array of `{min, max, rate}` objects

**Returns:** (number) Tax amount

### calcTaxesForLocation(location, ssIncome, iraIncome, investIncome)

Calculate federal and state taxes for a location.

**Parameters:**
- `location` (object) - Location config with `taxes` field
- `ssIncome` (number) - Social Security income
- `iraIncome` (number) - IRA/retirement income
- `investIncome` (number) - Investment/capital gains income

**Returns:** (object) Breakdown: `{federal, state, total, details, effectiveRate}`

### getInflationMultiplier(location, category, targetYear, currentYear)

Get inflation multiplier for a cost category.

### getProjectedMonthly(location, targetYear, fxDrift, currentYear)

Project monthly cost to a target year with inflation and FX drift.

### projectCosts(location, startYear, years, fxDrift, currentYear)

Full year-by-year cost projection.

### calcRMD(priorYearBalance, age, birthYear)

Calculate RMD for an individual.

### calcCoupleRMD(priorYearBalance, hAge, wAge, hBirthYear, wBirthYear, hAlive, wAlive)

Calculate RMD for a couple (uses older spouse).

### calcSSBenefit(pia, fra, claimAge)

Calculate Social Security benefit.

### calcSpousalBenefit(spousePIA, ownPIA, ownFRA, claimAge)

Calculate spousal benefit.

## License

MIT
