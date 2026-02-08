import { test, expect, type APIRequestContext } from '@playwright/test';

import { isProdEdgeBaseUrl } from '@/tests/helpers/qf318-edge';

type CountryLanguagePreferenceResponse = {
  id: number;
  country: string | null;
  user_device_language: string;
  default_locale: string;
  qr_default_locale: string;
  default_translations?: Array<{ id: number }>;
};

const fetchCountryLanguagePreference = async (
  request: APIRequestContext,
  language: string,
  country: string,
): Promise<CountryLanguagePreferenceResponse> => {
  const response = await request.get(
    `/api/proxy/content/api/qdc/resources/country_language_preference?user_device_language=${language}&country=${country}`,
    {
      headers: {
        accept: 'application/json',
        referer: `https://ssr.quran.com/${language}`,
        'user-agent': 'Mozilla/5.0',
      },
      failOnStatusCode: false,
    },
  );

  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(
      `country_language_preference failed (${language}/${country}): ${response.status()} ${body.slice(
        0,
        200,
      )}`,
    );
  }

  return (await response.json()) as CountryLanguagePreferenceResponse;
};

const translationIds = (payload: CountryLanguagePreferenceResponse): number[] =>
  (payload.default_translations || []).map((item) => item.id).sort((left, right) => left - right);

test.describe('QF-318 (prod) — country_language_preference contract', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'Vietnamese language contract resolves to Vietnamese defaults',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const payload = await fetchCountryLanguagePreference(request, 'vi', 'VN');

      expect(payload.user_device_language).toBe('vi');
      expect(payload.default_locale).toBe('vi');
      expect(payload.qr_default_locale).toBe('vi');
      expect((payload.default_translations || []).length).toBeGreaterThan(0);
    },
  );

  test(
    'Vietnamese language contract is stable across VN and US country inputs',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const vnPayload = await fetchCountryLanguagePreference(request, 'vi', 'VN');
      const usPayload = await fetchCountryLanguagePreference(request, 'vi', 'US');

      expect(vnPayload.default_locale).toBe(usPayload.default_locale);
      expect(vnPayload.qr_default_locale).toBe(usPayload.qr_default_locale);
      expect(translationIds(vnPayload)).toEqual(translationIds(usPayload));
    },
  );

  test(
    'English device in Vietnam resolves with Vietnam-specific locale defaults',
    { tag: ['@edge-matrix'] },
    async ({ request }) => {
      const payload = await fetchCountryLanguagePreference(request, 'en', 'VN');

      expect(payload.country).toBe('VN');
      expect(payload.user_device_language).toBe('en');
      expect(payload.default_locale).toBe('vi');
      expect(payload.qr_default_locale).toBe('en');
      expect((payload.default_translations || []).length).toBeGreaterThan(0);
    },
  );
});
