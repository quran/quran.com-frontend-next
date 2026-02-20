# Testing Strategy

**Project:** Quran.com Frontend (Next.js) **Status:** Living document — updated at the close of each
phase **Last Updated:** 2026-02-19

---

## Executive Summary

This document defines the multi-phase plan to bring the Quran.com frontend to production-grade test
coverage. The project has strong E2E infrastructure (84 Playwright specs, POM architecture, MSW,
Discord reporter) but critically low unit coverage (~7%) with hooks at 3% and components at 2.6%.
The foundational problem is that **writing component tests is artificially hard** — there is no
shared provider wrapper, no test data factories, and MSW is not wired into Vitest. Phase 1 fixes
that foundation.

---

## Current State Snapshot

| Layer          | Files      | Tested | Coverage | Health   |
| -------------- | ---------- | ------ | -------- | -------- |
| Utilities      | 114        | 45     | 39%      | Adequate |
| Redux Slices   | 34         | 6      | 18%      | Poor     |
| Hooks          | 100+       | 3      | 3%       | Critical |
| Components     | 910+       | 24     | 2.6%     | Critical |
| Pages          | 28+        | 0      | 0%       | Critical |
| Services / Lib | 7          | 0      | 0%       | Critical |
| **Unit Total** | **~1,378** | **96** | **~7%**  | **Red**  |
| E2E Specs      | 84         | —      | Partial  | Amber    |

### What Works Well

- 84 Playwright specs with POM architecture, centralized `TestId` enum, MSW, Discord reporter
- Good unit test quality where tests exist: AAA pattern, proper mocking, edge cases
- Multi-browser setup: Desktop Chrome + Mobile Chrome (Pixel 5)
- Auth setup project correctly separates guest vs authenticated Playwright runs
- Comprehensive `docs/playwright-test.md` for E2E contributors

### Critical Gaps

1. No shared render wrapper with providers — every component test must wire Redux, AuthContext, i18n
   manually
2. No test data factories — inline mock objects scattered and duplicated across files
3. MSW only wired for Playwright — unit tests cannot mock API calls
4. Playwright CI disabled (`if: false` in `playwright.yml`) — 84 E2E specs run against zero PRs
5. No coverage thresholds — 7% overall with zero enforcement
6. Auth utilities at 0% — token refresh and session logic entirely untested

---

## Guiding Principles

- **Tests should be easy to write.** Friction in test setup is the primary reason coverage stays
  low. Every phase reduces that friction.
- **Test behaviour, not implementation.** Prefer user-centric queries (`getByRole`, `getByTestId`)
  over internal state assertions.
- **Separation of layers.** Unit test logic in isolation; integration test user flows end-to-end.
  Don't test the same thing at two levels unnecessarily.
- **Ratchet, don't regress.** Coverage thresholds only go up; a PR that drops coverage below the
  current threshold is blocked.
- **Factories over fixtures.** Generated, typed test data is more maintainable than static JSON
  fixtures.
- **MSW is the boundary.** All API mocking at both unit and E2E level goes through MSW handlers. No
  `vi.mock` on `fetch` or API modules directly.

---

## Phase 0 — Policy (Team Decision Required)

> These items affect contributor workflow and require team agreement before implementation. They are
> documented here for completeness and future discussion.

| Item                       | What                                            | Impact                             |
| -------------------------- | ----------------------------------------------- | ---------------------------------- |
| Re-enable Playwright in CI | Remove `if: false` from `playwright.yml`        | 84 E2E specs guard every PR        |
| Coverage enforcement       | Add `coverage.thresholds` to `vitest.config.ts` | PRs that drop coverage are blocked |
| Pre-commit unit tests      | Add `vitest related --run` to `lint-staged`     | Broken tests cannot be committed   |

**These are not implemented in Phase 1.** They are proposed for team review as part of this PR.

---

## Phase 1 — Foundation ✦ Current Phase

**Branch:** `test/phase1-foundation` **Goal:** Make writing component and hook tests straightforward
for any contributor. **Definition of Done:** A new component test can be written using only
`renderWithProviders()` and a factory call — no manual provider wiring, no inline mock objects, no
ad-hoc API stubs.

### 1.1 Shared Render Wrapper

**File:** `src/tests/utils/render.tsx`

A custom `renderWithProviders()` that wraps React Testing Library's `render` with all required
providers: Redux store, AuthContext, i18n (next-translate), theme. Accepts an optional
`preloadedState` for Redux so each test can start from a known state.

**Why it matters:** Without this, every component test must manually wire 4+ providers. This is why
component coverage is at 2.6% — it's not that tests aren't valued, it's that they're painful to
write.

### 1.2 Redux Test Helpers

**File:** `src/tests/utils/redux.ts`

`makeStore(preloadedState?)` — creates a test Redux store with the same middleware as production but
without persistence side effects. Used by the render wrapper and standalone for slice tests.

### 1.3 Test Data Factories

**Directory:** `src/tests/factories/`

Typed factory functions for the core domain objects. Each factory produces a valid, complete object
with sensible defaults that can be partially overridden:

| Factory                     | Produces                                        |
| --------------------------- | ----------------------------------------------- |
| `makeVerse()`               | `Verse` with arabic text, keys, pagination      |
| `makeChapter()`             | `Chapter` with metadata, verse count            |
| `makeTranslation()`         | `Translation` with text, language, author       |
| `makeUser()`                | `UserProfile` with all required fields complete |
| `makeBookmark()`            | `Bookmark` with verse key, collection           |
| `makeCollection()`          | `Collection` with bookmarks array               |
| `makeAudioPlayerState()`    | Partial Redux `AudioPlayer` slice state         |
| `makeQuranReaderSettings()` | Partial Redux `QuranReader/styles` slice state  |

**Why it matters:** Inline mock objects duplicated across 96 test files means a type change breaks
all of them. Factories are the single source of truth for test data shape.

### 1.4 MSW Setup for Vitest

**File:** `src/tests/setup.ts`

Starts the MSW server before the Vitest test suite runs and resets handlers after each test.
Registers the existing handlers from `tests/mocks/msw/handlers.js` so unit tests can mock API calls
through the same mechanism as Playwright tests.

**New MSW handlers** added to `tests/mocks/msw/handlers.js`:

- Verses API (`GET */verses`)
- Chapters API (`GET */chapters`)
- Translations list (`GET */resources/translations`)
- Tafsirs list (`GET */resources/tafsirs`)
- Notes CRUD (`GET/POST/PUT/DELETE */notes`)
- Bookmarks CRUD (`GET/POST/DELETE */bookmarks`)
- Collections CRUD (`GET/POST/PUT/DELETE */collections`)

### 1.5 Vitest Config Update

**File:** `vitest.config.ts`

- Add `setupFiles: ['src/tests/setup.ts']` to initialize MSW before tests run
- Add coverage configuration with `provider: 'v8'`, include/exclude patterns, and reporters (`text`,
  `html`, `json-summary`) — thresholds are documented but not enforced until Phase 0 is agreed

### Definition of Done — Phase 1

- [ ] `renderWithProviders()` renders a component with Redux + AuthContext + i18n — verified by a
      smoke test
- [ ] `makeStore()` creates an isolated store with default state — verified by a slice test using it
- [ ] All 8 factories produce valid typed objects — verified by TypeScript compilation
- [ ] MSW server starts in Vitest — verified by a hook test that fetches data via SWR and asserts
      against the mocked response
- [ ] `yarn test:coverage` runs without error and produces an HTML report
- [ ] All existing 96 unit tests continue to pass — zero regressions

---

## Phase 2 — Critical Unit Test Gaps

**Goal:** Bring hooks from 3% to 40%+, components from 2.6% to 25%+, Redux slices from 18% to 50%+.
**Depends on:** Phase 1 complete.

### Priority Hooks (Weeks 3–4)

| Hook                                              | Why                                                           |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `useGetQueryParamOrReduxValue`                    | Controls reading mode, translation, font across the whole app |
| `useChapterId` / `useVerseKey`                    | Every reader page depends on these                            |
| `useDebounce`                                     | Search and settings changes                                   |
| `useDirection`                                    | RTL/LTR — silent breakage risk for Arabic users               |
| `useIsMobile`                                     | Drives responsive layout decisions                            |
| `useBookmarkBase` / `useBookmarkCacheInvalidator` | Bookmark mutation correctness                                 |
| `useReadingPreferenceSwitcher`                    | Theme/font/translation settings persistence                   |

### Priority Redux Slices (Weeks 4–5)

`theme`, `navbar`, `notifications`, `session`, all `AudioPlayer` reducers

### Priority Components (Weeks 5–7)

`QuranReader/VersesView`, `VerseActionsMenu`, `TranslationView`, `ReadingProgress`,
`QuranReaderStyles`

### Priority Utilities (Week 7–8)

`src/utils/auth/api.ts` (token refresh), `src/utils/auth/errors.ts`, `src/contexts/AuthContext.tsx`
reducer

---

## Phase 3 — E2E Gap Closure

**Goal:** Cover the highest-risk user journeys missing from the 84 existing Playwright specs.
**Depends on:** Parallel with Phase 2.

### New Specs to Add

| Spec File                                     | Flow Covered                    |
| --------------------------------------------- | ------------------------------- |
| `loggedin/logout.spec.ts`                     | Full logout + session cleanup   |
| `authentification/password-reset.spec.ts`     | Password reset end-to-end       |
| `loggedin/bookmark-collections.spec.ts`       | Bookmark collection CRUD        |
| `user-interactions/tafsir-switching.spec.ts`  | Tafsir selection and display    |
| `quran-reader/keyboard-navigation.spec.ts`    | Arrow key, page navigation      |
| `user-interactions/multi-translation.spec.ts` | Multiple translation comparison |
| `loggedin/reading-goal-flow.spec.ts`          | Reading goal and streak flow    |

### New POMs to Add

`QuranReaderPage`, `BookmarksPage`, `SearchPage`

### Test Tagging Strategy

| Tag           | Scope                     | Run Frequency                 |
| ------------- | ------------------------- | ----------------------------- |
| `@smoke`      | 15–20 critical path tests | Every commit                  |
| `@regression` | Full suite                | Nightly + PRs to `production` |
| `@auth`       | Logged-in flows           | Requires auth secrets         |
| `@mobile`     | Mobile viewport tests     | Every commit                  |

---

## Phase 4 — Accessibility & Visual Regression

**Goal:** Automated a11y checks on every critical flow; visual regression guard for all three
themes.

- `@axe-core/playwright` integrated into Playwright helper (`tests/helpers/a11y.ts`)
- A11y checks added to all page navigation tests and modal open states
- Dedicated `@rtl` Playwright project with `Accept-Language: ar`
- Playwright screenshot comparisons for Surah page (light/dark/sepia), Audio player, Drawers, Mobile
  navigation
- Storybook `play` functions for DLS components: Button, Modal, Dropdown, Toast

---

## Phase 5 — Coverage Enforcement & TDD Adoption

**Goal:** Coverage ratchet in CI; TDD as the default workflow for new features.

### Coverage Targets

| Phase End      | Lines    | Functions | Branches                   |
| -------------- | -------- | --------- | -------------------------- |
| Phase 1        | —        | —         | — (reported, not enforced) |
| Phase 2        | 50%      | 48%       | 42%                        |
| Phase 3        | 60%      | 58%       | 52%                        |
| Phase 5        | **70%**  | **68%**   | **60%**                    |
| Critical paths | **100%** | **100%**  | **100%**                   |

100% required for: `src/utils/auth/`, Redux slice reducers, `src/contexts/AuthContext.tsx`.

---

## File Map

```
src/
  tests/
    factories/
      index.ts          # Re-exports all factories
      verse.ts
      chapter.ts
      translation.ts
      user.ts
      bookmark.ts
      collection.ts
      audioPlayer.ts
      quranReaderSettings.ts
    utils/
      render.tsx         # renderWithProviders()
      redux.ts           # makeStore()
    setup.ts             # MSW + Vitest global setup

tests/
  mocks/
    msw/
      handlers.js        # Extended with Verses, Chapters, Notes, Bookmarks, Collections handlers
```

---

## References

- `docs/COMMON_MISTAKES.md` — patterns that have caused production bugs; review before writing tests
- `docs/playwright-test.md` — E2E testing guide
- `tests/test-ids.ts` — centralized TestId enum for Playwright selectors
- `tests/POM/` — existing Page Object Models
- `tests/helpers/` — shared E2E helpers
