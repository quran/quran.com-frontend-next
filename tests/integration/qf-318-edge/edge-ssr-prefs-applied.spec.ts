import { test, expect } from '@playwright/test';

import { base64UrlEncodeUtf8, extractNextDataJson, isProdEdgeBaseUrl } from '@/tests/helpers/qf318-edge';

test.describe('QF-318 (prod) — SSR applies prefs cookie', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');

  test(
    'SSR applies QDC_PREFS in __NEXT_DATA__',
    { tag: ['@edge-smoke'] },
    async ({ request }) => {
      const preferences = {
        quranReaderStyles: { quranFont: 'code_v2', mushafLines: '16_lines' },
        translations: { selectedTranslations: [220] },
        tafsirs: { selectedTafsirs: ['169'] },
        reading: { selectedWordByWordLocale: 'en' },
        userHasCustomised: { userHasCustomised: false },
      };

      const encoded = base64UrlEncodeUtf8(JSON.stringify(preferences));
      const cookie = `QDC_PREFS=${encoded}; QDC_PREFS_KEY=demo123; QDC_PREFS_VER=1`;

      const res = await request.get('/vi?__edge_smoke=ssr-prefs', {
        headers: { accept: 'text/html', cookie },
      });
      expect(res.ok()).toBe(true);

      const html = await res.text();
      const nextData = extractNextDataJson(html);
      expect(nextData).toBeTruthy();

      const pageProps = nextData?.props?.pageProps;
      expect(pageProps?.ssrPreferencesApplied).toBe(true);

      const state = pageProps?.__REDUX_STATE__;
      expect(state?.quranReaderStyles?.mushafLines).toBe('16_lines');
      expect(state?.quranReaderStyles?.quranFont).toBe('code_v2');
      expect(state?.translations?.selectedTranslations).toContain(220);
      expect(state?.tafsirs?.selectedTafsirs?.[0]).toBe('169');
    },
  );
});

