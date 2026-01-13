# Playwright Tests - AI Guide

This doc is for an AI writing Playwright tests from scratch in this repo. Follow it to keep tests
consistent, stable, and fast.

## Where things live

- Integration tests: `tests/integration/**`
- Logged-in tests: `tests/integration/loggedin/**`
- Auth setup (creates storage state): `tests/auth.setup.ts`
- Page objects (POM): `tests/POM/**`
- Shared helpers: `tests/helpers/**`
- Central test ids: `tests/test-ids.ts`
- Mocking (MSW): `tests/mocks/msw/**`
- Playwright config: `playwright.config.ts`

## Running tests

- All integration: `yarn test:integration`
- Single file: `yarn test:integration tests/integration/<path>.spec.ts`
- Base URL: `PLAYWRIGHT_TEST_BASE_URL` or `http://localhost:<PORT|3000>`

## Auth and logged-in tests

- Logged-in tests run in the `loggedin` project and use `playwright/.auth/user.json`.
- `tests/auth.setup.ts` creates that file using `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`.
- If those env vars are missing, logged-in tests will fail.

## Logged-in prerequisites (shared account state)

Logged-in tests run against a shared account that can carry state across runs. Do not assume any
user preferences are still at defaults. Always set prerequisites explicitly before assertions.

- If a test asserts English text, call `ensureEnglishLanguage(page)` at the start.
- If a test depends on selected translations, reset them via
  `clearSelectedTranslations(page, { isMobile })` and then add exactly what you need with
  `selectTranslationPreference(page, translationId, { isMobile })`.
- For other user settings (theme, word-by-word toggles, mushaf lines), set them explicitly using
  helpers in `tests/helpers/settings.ts`. Do not rely on previous test state.

## Selector strategy

Prefer stable, user-facing queries:

- `page.getByRole(...)` for buttons/links/inputs.
- `page.getByTestId(...)` with `TestId` from `tests/test-ids.ts`.
- Use helper builders for dynamic ids: `getVerseTestId`, `getChapterContainerTestId`,
  `getLanguageItemTestId`, etc.

Avoid brittle CSS selectors. If multiple nodes share a test id, scope the locator or use `:visible`
to pick the rendered instance.

## Shared helpers (reuse these)

Settings and UI:

- `tests/helpers/settings.ts`
  - `changeWebsiteTheme`, `withSettingsDrawer`, `selectQuranFont`, `selectMushafLines`, word-by-word
    helpers.
- `tests/helpers/navigation.ts`
  - `openNavigationDrawer`, `openSearchDrawer`, `openQuranNavigation`.
- `tests/helpers/language.ts`
  - `selectNavigationDrawerLanguage`, `ensureEnglishLanguage`.
- `tests/helpers/mode-switching.ts`
  - `switchToReadingMode`, `switchToTranslationMode`.
- `tests/helpers/banner.ts`
  - `clickCreateMyGoalButton`.
- `tests/helpers/streak-api-mocks.ts`
  - `mockStreakWithGoal`, `mockStreakWithoutGoal`.

Page objects:

- `tests/POM/home-page.ts` (common navigation helpers, settings, search).
- `tests/POM/mushaf-mode.ts`, `tests/POM/audio-utilities.ts`.

If a helper exists, use it. If not, add a new helper instead of duplicating logic across specs.

## Test structure and style

- Follow AAA: Arrange, Act, Assert.
- Use `test.describe` to group cases.
- Use tags when relevant: `@slow`, `@auth`, `@profile`, `@smoke`, etc.
- Prefer `await expect(locator).toBeVisible()` over `waitForTimeout`.
- For navigation checks: `await Promise.all([action, page.waitForURL(...)])`.

## Mocking and network

- For shared API mocks, extend `tests/mocks/msw/handlers.js`.
- For test-specific API behavior, use `page.route(...)` inside the spec.

## Adding new test ids

- Add `data-testid` in the component (use existing patterns in `src`).
- Mirror the id in `tests/test-ids.ts` and use the enum or helper functions.

## Common pitfalls

- Form submit buttons can be disabled until the form is valid. If you need validation errors, fill
  inputs and blur them instead of clicking a disabled button.
- Hidden checkboxes should be toggled via the label (use `setCheckboxValue` in
  `tests/helpers/settings.ts`).
- Some UI elements exist twice (mobile/desktop). Use scoped locators or `:visible`.

## Minimal test template

```ts
import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

test.describe('Feature X', () => {
  test('does Y', async ({ page, context }) => {
    const home = new Homepage(page, context);
    await home.goTo('/');

    await page.getByTestId(TestId.NAVIGATE_QURAN_BUTTON).click();
    await expect(page.getByTestId(TestId.NAVIGATION_DRAWER)).toBeVisible();
  });
});
```
