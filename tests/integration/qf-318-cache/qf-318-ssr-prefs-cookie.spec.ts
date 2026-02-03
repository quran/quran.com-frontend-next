import { test, expect } from '@playwright/test';

const isLocalBaseUrl = () => {
  const base = process.env.PLAYWRIGHT_TEST_BASE_URL;
  return !base || base.includes('localhost') || base.includes('127.0.0.1');
};

const base64UrlEncodeUtf8 = (value: string) =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const extractNextDataJson = (html: string) => {
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const after = start + marker.length;
  const end = html.indexOf('</script>', after);
  if (end === -1) return null;
  return JSON.parse(html.slice(after, end));
};

test.describe('QF-318 (local) — SSR applies QDC_PREFS on first paint', () => {
  test.skip(!isLocalBaseUrl(), 'Local deterministic test (requires localhost baseURL)');
  test.use({ javaScriptEnabled: false });

  test(
    'SSR uses QDC_PREFS to render initial Redux state',
    { tag: ['@qf318-cache', '@ssr'] },
    async ({ page, context }) => {
      const preferences = {
        quranReaderStyles: {
          quranFont: 'text_indopak',
          mushafLines: '16_lines',
          quranTextFontScale: 4,
          translationFontScale: 3,
          tafsirFontScale: 3,
          wordByWordFontScale: 3,
          reflectionFontScale: 3,
          lessonFontScale: 3,
          qnaFontScale: 3,
          isUsingDefaultFont: false,
        },
        translations: { selectedTranslations: [131] },
        tafsirs: { selectedTafsirs: ['169'] },
        reading: {
          selectedWordByWordLocale: 'fr',
          selectedReflectionLanguages: ['en', 'fr'],
          selectedLessonLanguages: ['en'],
        },
        userHasCustomised: { userHasCustomised: true },
      };

      const encoded = base64UrlEncodeUtf8(JSON.stringify(preferences));

      await context.addCookies([
        {
          name: 'QDC_PREFS',
          value: encoded,
          domain: 'localhost',
          path: '/',
        },
        {
          name: 'QDC_PREFS_KEY',
          value: 'demo123',
          domain: 'localhost',
          path: '/',
        },
        {
          name: 'QDC_PREFS_VER',
          value: '1',
          domain: 'localhost',
          path: '/',
        },
      ]);

      await page.goto('/en/1');

      const html = await page.content();
      const nextData = extractNextDataJson(html);
      expect(nextData).toBeTruthy();

      const pageProps = nextData?.props?.pageProps;
      expect(pageProps?.ssrPreferencesApplied).toBe(true);

      const state = pageProps?.__REDUX_STATE__;
      expect(state).toBeTruthy();

      expect(state?.quranReaderStyles?.quranFont).toBe('text_indopak');
      expect(state?.quranReaderStyles?.mushafLines).toBe('16_lines');
      expect(state?.translations?.selectedTranslations).toContain(131);
      expect(state?.tafsirs?.selectedTafsirs?.[0]).toBe('169');
      expect(state?.readingPreferences?.selectedWordByWordLocale).toBe('fr');
      expect(state?.defaultSettings?.userHasCustomised).toBe(true);
    },
  );
});
