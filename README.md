# MultiBank Trading Platform – Cypress Automation

End-to-end tests for https://trade.multibank.io built with Cypress + TypeScript, with advanced reporting, performance and accessibility checks, and CI via GitHub Actions. Includes a standalone “String Character Frequency” utility as part of Task 2.2.

## Prerequisites
- Node.js 18+
- npm 8+

## Setup
```powershell
npm install
npx cypress verify
npm run type-check
```

## Run Cypress Tests
```powershell
# Open interactive runner
npm run cy:open

# Headless run (default browser)
npm run cy:run

# Cross-browser runs
npm run cy:run:chrome
npm run cy:run:firefox
npm run cy:run:edge

# All browsers sequentially
npm run test:all-browsers
```

## Reports & CI
- Reporter: `cypress-mochawesome-reporter` produces HTML + JSON artifacts.
- CI: GitHub Actions installs, verifies, runs tests, and uploads artifacts (screenshots, videos, mochawesome HTML/JSON, consolidated HTML under `cypress/reports/html`).
- Accessibility is non-blocking by default (violations logged). To enforce:
```powershell
npx cypress run --env a11y.failOnError=true
```

## Architecture (High-Level)
- Page Object Model with typed custom commands.
- Reliability helpers: network idle wait and stable-element polling.
- Test tagging via `@cypress/grep`.
- Performance checks: TTFB, FCP/LCP (proxy), CLS proxy within budgets.
- Accessibility via `cypress-axe` (configurable gating).

---

## Task 2.2 – String Character Frequency

Write a program that counts character occurrences in a string and outputs them in the order of first appearance.

Example
- Input: `"hello world"`
- Output: `h:1, e:1, l:3, o:2, w:1, r:1, d:1`

### Source
- Implementation: `scripts/charfreq.js`
- Tests: `scripts/charfreq.test.js`

### Assumptions
- Case-insensitive by default (normalize to lower-case). Use `--case-sensitive` to preserve case.
- Whitespace ignored by default. Use `--include-whitespace` to count spaces/newlines/tabs.
- Punctuation and digits are counted by default (non-whitespace characters are included).
- Unicode-safe iteration over code points (emoji and astral symbols supported).

### How It Works (Brief)
- Iterates the string by code point, applying options.
- Uses a `Map` to preserve insertion order and count in O(n) time.
- Formats results as `char:count` joined by commas.

### Run (CLI)
```powershell
# Basic
npm run charfreq -- "hello world"

# Case-sensitive and include whitespace
npm run charfreq -- --case-sensitive --include-whitespace "Aa a\n\t"

# From stdin
echo hello world | npm run charfreq --
```

### Run Tests (Utility)
```powershell
npm run charfreq:test
```

Expected sample output:
```
h:1, e:1, l:3, o:2, w:1, r:1, d:1
```

### Design and Trade-offs
- Simplicity and zero dependencies for portability.
- Defaults chosen to match the example and typical expectations.
- Configurable flags cover common variations without overcomplicating the interface.

---

## Maintenance & Extension
- Add additional Cypress specs for key user flows (login, trade, funding) using the existing POM and helpers.
- Adjust performance budgets via `cypress.config.ts` env values.
- Flip accessibility gating on in CI by passing `--env a11y.failOnError=true`.
- Extend `scripts/charfreq.js` with additional filters if needed (e.g., restrict to alphanumerics).

## Submission
- Repository: https://github.com/CaffeinBonafide/multibank_test
- CI evidence: See latest GitHub Actions run artifacts (HTML reports, screenshots, videos).

