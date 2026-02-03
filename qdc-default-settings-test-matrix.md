# QF-318 — Default Localization & Settings Test Matrix

Source of truth:

- Product acceptance criteria: `jira-specs.md`
- QA (Qase) export: `QF-2026-02-02.json` (suite: **[QF-318]**)

## Acceptance criteria → Qase coverage

### Country + device language detection

- Detect user’s country (IP) + device language

  - Qase: 704, 705, 706

- Supported app languages list
  - Qase: 701

### First-time guest defaults

- First-time guest, device language = **English** → defaults depend on **country**

  - Qase: 704

- First-time guest, device language = **supported non-English** → defaults depend on **language**,
  ignore country

  - Qase: 705

- First-time guest, device language = **unsupported** → treat as **English**, defaults depend on
  **country**

  - Qase: 706

- Default guest settings saved in Redux
  - Qase: 702

### Signup / login persistence

- Guest signs up → settings saved in DB

  - Qase: 703

- Guest logs in → load view using user settings if they exist
  - Qase: 707, 708

### Reset settings

- Reset settings → behave like “first time on QDC”
  - Qase: 709

### Change language (manual localization switch)

- If user changed **any** of: Mushaf, Translation, Tafsir, WBW language, Reciter, Reflections
  language → change locale **only**, keep settings as-is

  - Guest coverage: 710–723, 742
  - Logged-in coverage: 724–737, 743

- If user changed **none** of those preferences:
  - Switching to **English** → settings should update based on **country**
    - Guest: 738
    - Logged-in: 740
  - Switching to **supported non-English** → settings should update based on **selected language**
    (ignore country)
    - Guest: 739
    - Logged-in: 741

### Reflections languages

- Reflection languages list should match the sheet for the resolved defaults
  - Guest: 744
  - Logged-in: 745

### References / meta cases

- Diagram reference
  - Qase: 699
- Sheet reference
  - Qase: 700
- Cross-browser runs
  - Qase: 746, 747, 748

## Technical validation (edge caching + SSR preferences)

These are _engineering_ checks to validate the caching architecture added for performance.

- SSR applies preferences snapshot from cookies on first paint:
  - `node scripts/qf-318/ssr-prefs.test.mjs`
- Edge cache HIT/MISS behavior (Cloudflare Snippet) for guest + prefsKey buckets + private-route
  isolation:
  - `./scripts/qf-318/edge-cache-smoke.sh`
