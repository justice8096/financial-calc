# Financial Calculation Library

## Purpose
Pure JavaScript financial calculation libraries with zero dependencies. Covers tax bracket calculations, inflation projections, Social Security benefits, Required Minimum Distributions, and currency formatting.

## Tools & Stack
- **JavaScript** (ESM modules)
- **Vitest** for testing (142 tests, 97.5% coverage)

## Directory Structure
```
src/
  index.js               — Main exports
  taxes.js               — Generic bracket tax engine + US federal/state/foreign tax credit
  inflation.js           — Per-category inflation projection with FX drift
  rmd.js                 — IRS Required Minimum Distributions (SECURE 2.0 Act)
  socialSecurity.js      — SS benefit reduction/delayed credits, spousal benefits
  formatting.js          — Currency and percentage formatting
  constants.js           — Cost categories, inflation defaults
tests/
  *.test.js              — 142 tests
```

## Key Commands
```bash
npm test                 # Run all tests
npm run test:coverage    # Coverage report (97.5%)
```

## Key Functions
- `calcBracketTax(income, brackets)` — Generic: works with any bracket table
- `calcTaxesForLocation(loc, ssIncome, iraIncome, investIncome)` — US-specific
- `getInflationMultiplier(loc, category, targetYear)` — Per-category compound inflation
- `projectCosts(loc, startYear, years, fxDrift)` — Full year-by-year projection
- `calcSSBenefit(pia, fra, claimAge)` — SS benefit with early/late adjustments
- `calcSpousalBenefit(spousePIA, ownPIA, ownFRA, claimAge)` — Spousal benefit
- `calcRMD(priorYearBalance, age, birthYear)` — SECURE 2.0 Act RMD
- `getRMDStartAge(birthYear)` — 72/73/75 based on birth year

## Technical Notes
- Zero npm dependencies — pure calculation functions
- All functions are deterministic (no side effects, no I/O)
- Tax brackets table is generic: `[{min, max, rate}, ...]`
- SECURE 2.0 Act: born ≤1950→72, 1951-1959→73, 1960+→75
- SS: first 36 months early = 5/9 of 1% reduction; beyond 36 = 5/12 of 1%
- SS delayed credits: 8% per year beyond FRA
