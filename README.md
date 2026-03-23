# Financial Calculation Library

ESM-based utilities for retirement planning calculations: taxes, inflation, RMD, Social Security benefits, and formatting. Zero npm dependencies, fully generic and flexible.

## Installation

```bash
npm install @justice8096/financial-calc
```

## Features

- **Pure JavaScript** – Zero npm dependencies, runs anywhere
- **Generic modules** – Tax bracket engine and inflation projector work with any tax system or country
- **Retirement-specific** – Specialized calculations for US Social Security and RMDs (SECURE 2.0 Act)
- **TypeScript support** – Full `.d.ts` declarations included
- **Deterministic** – All functions are side-effect-free and purely computational

## Module Overview

Modules are split into two categories:

### Generic Modules

These work with any tax system, any currency, or any financial scenario.

#### Taxes (`src/taxes.js`)

Generic bracket-based tax calculation engine plus US-specific tax functions.

```javascript
import { calcBracketTax, calcTaxesForLocation } from '@justice8096/financial-calc/taxes';

// Generic: Any tax bracket system
const brackets = [
  { min: 0, max: 11000, rate: 0.10 },
  { min: 11000, max: 44725, rate: 0.12 },
  { min: 44725, max: Infinity, rate: 0.22 },
];
const tax = calcBracketTax(50000, brackets); // $5,525

// US-specific: Multi-location with state/federal/foreign credits
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

#### Inflation (`src/inflation.js`)

Project costs with per-category inflation and currency drift.

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

#### Formatting (`src/formatting.js`)

Format numbers for display.

```javascript
import { fmt, fmtK, pct } from '@justice8096/financial-calc/formatting';

fmt(50000); // "$50,000"
fmtK(50000); // "$50K"
pct(0.25); // "25.0%"
```

### Retirement-Specific Modules

Specialized calculations for US retirement planning.

#### RMD (`src/rmd.js`)

Calculate Required Minimum Distributions (US retirement accounts). Follows SECURE 2.0 Act rules:
- Born ≤1950: RMDs start at 72
- Born 1951-1959: RMDs start at 73
- Born 1960+: RMDs start at 75

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

#### Social Security (`src/social-security.js`)

Calculate benefits based on claiming age and spousal benefits. Includes early reductions and delayed credits.

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

## API Reference

### Taxes Module

#### `calcBracketTax(income, brackets)`

Calculate tax using a bracket system.

**Parameters:**
- `income` (number) - Taxable income
- `brackets` (array) - Array of `{min, max, rate}` objects

**Returns:** (number) Tax amount

#### `calcTaxesForLocation(location, ssIncome, iraIncome, investIncome)`

Calculate federal and state taxes for a location.

**Parameters:**
- `location` (object) - Location config with `taxes` field
- `ssIncome` (number) - Social Security income
- `iraIncome` (number) - IRA/retirement income
- `investIncome` (number) - Investment/capital gains income

**Returns:** (object) Breakdown: `{federal, state, total, details, effectiveRate}`

### Inflation Module

#### `getInflationMultiplier(location, category, targetYear, currentYear)`

Get inflation multiplier for a cost category.

#### `getFxMultiplier(location, yearsOut, fxDrift)`

Get currency drift multiplier.

#### `getProjectedMonthly(location, targetYear, fxDrift, currentYear)`

Project monthly cost to a target year with inflation and FX drift.

#### `projectCosts(location, startYear, years, fxDrift, currentYear)`

Full year-by-year cost projection.

### RMD Module

#### `getRMDStartAge(birthYear)`

Get RMD start age based on birth year (72, 73, or 75).

#### `calcRMD(priorYearBalance, age, birthYear)`

Calculate RMD for an individual.

#### `calcCoupleRMD(priorYearBalance, hAge, wAge, hBirthYear, wBirthYear, hAlive, wAlive)`

Calculate RMD for a couple (uses older spouse).

### Social Security Module

#### `calcSSBenefit(pia, fra, claimAge)`

Calculate Social Security benefit with early/late adjustments.

#### `calcSpousalBenefit(spousePIA, ownPIA, ownFRA, claimAge)`

Calculate spousal benefit.

### Formatting Module

#### `fmt(n)`

Format as currency (e.g., "$50,000").

#### `fmtK(n)`

Format as currency in thousands (e.g., "$50K").

#### `pct(n)`

Format as percentage (e.g., "25.0%").

## Testing

Run tests with Node's built-in test runner:

```bash
npm test
```

## TypeScript

Full TypeScript declarations are included in `src/index.d.ts`. All exported functions, types, and interfaces are fully typed.

```typescript
import { calcBracketTax, TaxBracket } from '@justice8096/financial-calc/taxes';

const brackets: TaxBracket[] = [
  { min: 0, max: 11000, rate: 0.10 },
  { min: 11000, max: Infinity, rate: 0.12 },
];

const tax: number = calcBracketTax(50000, brackets);
```

## Architecture

All modules are:
- **Deterministic** – No side effects, no I/O
- **Zero dependencies** – Pure JavaScript functions
- **Generic** – Functions accept configuration objects, not location-specific constants
- **Well-documented** – JSDoc comments on all functions

## License

MIT
