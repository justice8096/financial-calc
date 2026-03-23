---
name: financial-calc
description: US financial calculations — tax brackets, Social Security, RMDs, and inflation projections
version: 0.1.0
---

# Financial Calculation Library Skill

Use this skill when the user needs help with US financial calculations including tax brackets, Social Security benefits, Required Minimum Distributions, or inflation-adjusted projections.

## When to use
- User asks about tax bracket calculations
- User wants to model Social Security benefits (own, spousal, delayed credits)
- User needs RMD calculations (SECURE 2.0 Act rules)
- User wants inflation-adjusted cost projections
- User is building a retirement planning tool

## Available modules

### Tax Bracket Engine
```javascript
import { calcBracketTax, calcTaxesForLocation } from '@justice8096/financial-calc/taxes';

// Generic bracket calculation (works with any bracket table)
const tax = calcBracketTax(85000, federalBrackets2024);

// US-specific: federal + state combined
const { federal, state, total, effectiveRate } = calcTaxesForLocation(85000, 'single', 'CA');
```

### Social Security
```javascript
import { calcSSBenefit, calcSpousalBenefit } from '@justice8096/financial-calc/social-security';

// Own benefit with early/delayed claiming
const monthly = calcSSBenefit({ pia: 2800, fra: 67, claimAge: 65 });

// Spousal benefit
const spousal = calcSpousalBenefit({ spousePIA: 3200, fra: 67, claimAge: 66 });
```

### Required Minimum Distributions
```javascript
import { calcRMD, getRMDStartAge } from '@justice8096/financial-calc/rmd';

const startAge = getRMDStartAge(1960); // 75 (SECURE 2.0)
const rmd = calcRMD({ balance: 500000, age: 75 }); // Uses Uniform Lifetime Table III
```

### Inflation Projections
```javascript
import { projectCosts, getInflationMultiplier } from '@justice8096/financial-calc/inflation';

const projected = projectCosts({
  categories: { housing: 2000, food: 800, healthcare: 500 },
  years: 20,
  rates: { housing: 0.03, food: 0.04, healthcare: 0.06 }
});
```

## Key behaviors
- Pure calculation functions — no side effects, no dependencies
- 142 tests with 97.5% coverage
- ESM module format
- All monetary values in USD cents internally for precision
