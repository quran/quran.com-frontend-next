#!/usr/bin/env node
/**
 * QF-318 SSR preferences smoke test.
 *
 * Verifies that SSR reads `QDC_PREFS` and applies it into `pageProps.__REDUX_STATE__`
 * (first paint) without relying on client-only hydration.
 *
 * Usage:
 *   node scripts/qf-318/ssr-prefs.test.mjs
 *
 * Optional env vars:
 *   BASE_URL=https://ssr.quran.com
 *   LOCALE=en
 *   PATHNAME=/1
 */

const BASE_URL = process.env.BASE_URL || 'https://ssr.quran.com';
const LOCALE = process.env.LOCALE || 'en';
const PATHNAME = process.env.PATHNAME || '/1';

const stableSortJsonValue = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stableSortJsonValue);
  const keys = Object.keys(value).sort();
  const out = {};
  for (const k of keys) {
    const v = value[k];
    if (typeof v === 'undefined') continue;
    out[k] = stableSortJsonValue(v);
  }
  return out;
};

const stableStringify = (value) => JSON.stringify(stableSortJsonValue(value));

const base64UrlEncode = (value) =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

// cyrb53-like, stable across JS engines.
const stableHashToKey = (value) => {
  let h1 = 0xdeadbeef ^ value.length;
  let h2 = 0x41c6ce57 ^ value.length;

  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return hash.toString(36);
};

const assert = (condition, message) => {
  if (!condition) {
    // eslint-disable-next-line no-console
    console.error(`❌ ${message}`);
    process.exit(1);
  }
};

const extractNextDataJson = (html) => {
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const after = start + marker.length;
  const end = html.indexOf('</script>', after);
  if (end === -1) return null;
  const jsonText = html.slice(after, end);
  return JSON.parse(jsonText);
};

const makeCookieHeader = (prefs) => {
  const json = stableStringify(prefs);
  const encoded = base64UrlEncode(json);
  const key = stableHashToKey(json);
  return `QDC_PREFS=${encoded}; QDC_PREFS_KEY=${key}; QDC_PREFS_VER=1`;
};

// Pick values that are very likely to differ from defaults, so the assertion is meaningful.
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
  translations: {
    selectedTranslations: [131],
  },
  tafsirs: {
    selectedTafsirs: ['169'],
  },
  reading: {
    selectedWordByWordLocale: 'fr',
    selectedReflectionLanguages: ['en', 'fr'],
    selectedLessonLanguages: ['en'],
  },
  userHasCustomised: {
    userHasCustomised: true,
  },
};

const run = async () => {
  const url = new URL(`/${LOCALE}${PATHNAME}`, BASE_URL).toString();
  const cookieHeader = makeCookieHeader(preferences);

  const res = await fetch(url, {
    headers: {
      Cookie: cookieHeader,
      Accept: 'text/html',
    },
  });

  assert(res.ok, `Request failed: ${res.status} ${res.statusText}`);
  const html = await res.text();
  const nextData = extractNextDataJson(html);
  assert(nextData, 'Unable to find __NEXT_DATA__ in HTML');

  const pageProps = nextData?.props?.pageProps;
  assert(pageProps, 'Missing props.pageProps in __NEXT_DATA__');
  assert(pageProps.ssrPreferencesApplied === true, 'Expected ssrPreferencesApplied === true');

  const state = pageProps.__REDUX_STATE__;
  assert(state, 'Missing pageProps.__REDUX_STATE__');

  assert(
    state?.quranReaderStyles?.quranFont === 'text_indopak',
    'Expected quranReaderStyles.quranFont to match cookie',
  );
  assert(
    state?.quranReaderStyles?.mushafLines === '16_lines',
    'Expected quranReaderStyles.mushafLines to match cookie',
  );
  assert(
    Array.isArray(state?.translations?.selectedTranslations) &&
      state.translations.selectedTranslations.includes(131),
    'Expected translations.selectedTranslations to include 131',
  );
  assert(
    Array.isArray(state?.tafsirs?.selectedTafsirs) && state.tafsirs.selectedTafsirs[0] === '169',
    'Expected tafsirs.selectedTafsirs[0] === "169"',
  );
  assert(
    state?.readingPreferences?.selectedWordByWordLocale === 'fr',
    'Expected readingPreferences.selectedWordByWordLocale === "fr"',
  );
  assert(
    state?.defaultSettings?.userHasCustomised === true,
    'Expected defaultSettings.userHasCustomised === true',
  );

  // eslint-disable-next-line no-console
  console.log('✅ SSR preferences applied correctly');
};

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
