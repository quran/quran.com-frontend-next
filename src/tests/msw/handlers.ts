import { http, HttpResponse } from 'msw';

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
