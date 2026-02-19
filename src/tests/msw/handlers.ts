import { http, HttpResponse } from 'msw';

// Relative import — intentional. The `@/tests` alias resolves to `src/tests/`,
// not the root `tests/` directory (which is Playwright-only). We must cross the
// src/ boundary with a relative path to reach the shared Playwright mock data.
// If this file moves, update the path accordingly.
import { mockCountryLanguagePreferences } from '../../../tests/mocks/data';

/**
 * MSW handlers for Vitest unit tests.
 *
 * These are ESM-native handlers kept separate from the CommonJS handlers
 * used by Playwright integration tests (tests/mocks/msw/handlers.js).
 * This avoids CJS/TypeScript interop issues in the Vitest module graph.
 */
export const handlers = [
  http.get('*/api/proxy/preferences/country-language', ({ request }) => {
    const url = new URL(request.url);
    const localeCode = url.searchParams.get('locale') ?? 'en-US';
    const preferences =
      mockCountryLanguagePreferences[localeCode as keyof typeof mockCountryLanguagePreferences] ??
      mockCountryLanguagePreferences['en-US'];
    return HttpResponse.json(preferences);
  }),
];
