/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

import { loginWithEmail } from '@/tests/helpers/auth';
import { ensureEnglishLanguage, selectNavigationDrawerLanguage } from '@/tests/helpers/language';
import { isProdEdgeBaseUrl } from '@/tests/helpers/qf318-edge';
import { getPersistedSlice, waitForReduxHydration } from '@/tests/helpers/qf318-state';
import { openSettingsDrawer, selectAnyTranslationPreference } from '@/tests/helpers/settings';

const hasCreds = () => Boolean(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);

type DebugCapture = {
  consoleErrors: string[];
  pageErrors: string[];
  requestFailures: string[];
  badStaticResponses: string[];
};

const attachDebugCapture = (page: Page): DebugCapture => {
  const debug: DebugCapture = {
    consoleErrors: [],
    pageErrors: [],
    requestFailures: [],
    badStaticResponses: [],
  };

  const push = (list: string[], value: string) => {
    if (list.length >= 25) return;
    list.push(value);
  };

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    push(debug.consoleErrors, msg.text());
  });
  page.on('pageerror', (err) => push(debug.pageErrors, err.message || String(err)));
  page.on('requestfailed', (req) => {
    const failure = req.failure();
    push(debug.requestFailures, `${failure?.errorText || 'FAILED'} ${req.url()}`);
  });
  page.on('response', (res) => {
    const url = res.url();
    if (!url.includes('/_next/static')) return;
    if (res.status() < 400) return;
    push(debug.badStaticResponses, `${res.status()} ${url}`);
  });

  return debug;
};

const getBaseOrigin = () => {
  const base = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://ssr.quran.com';
  return new URL(base).origin;
};

const setManualLocaleCookies = async (page: Page, locale: string) => {
  const origin = `${getBaseOrigin()}/`;
  await page.context().addCookies([
    { name: 'NEXT_LOCALE', value: locale, url: origin },
    { name: 'QDC_MANUAL_LOCALE', value: '1', url: origin },
  ]);
};

const clearAuthAndQdcCookies = async (page: Page) => {
  const cookies = await page.context().cookies();
  const toClear = cookies.filter((cookie) => {
    if (cookie.name === 'NEXT_LOCALE') return true;
    if (cookie.name.startsWith('QDC_')) return true;
    if (cookie.name === 'id' || cookie.name.startsWith('id_')) return true;
    return false;
  });

  if (toClear.length === 0) return;

  await page.context().addCookies(
    toClear.map((cookie) => ({
      name: cookie.name,
      value: '',
      domain: cookie.domain,
      path: cookie.path,
      expires: 0,
    })),
  );
};

const ensureLastReadVerseSeeded = async (page: Page) => {
  const state = page as any;
  if (state.__qdc_lastReadSeeded) return;
  state.__qdc_lastReadSeeded = true;

  // The ContextMenu is gated on readingTracker.lastReadVerse being set. On prod we occasionally
  // see the intersection observer not updating it (hydration noise / flakiness), so we seed it
  // in persisted state to make the settings drawer reliably reachable.
  await page.addInitScript(
    (lastReadVerse) => {
      try {
        const storageKey = 'persist:root';
        const raw = localStorage.getItem(storageKey);
        // Avoid creating a partial redux-persist root state on fresh profiles. When redux-persist
        // migrations run against an incomplete object, the app can crash on boot.
        if (!raw) return;

        let root: any = {};
        try {
          root = JSON.parse(raw) || {};
        } catch {
          return;
        }

        if (!root?._persist) return;

        const existingRaw = root.readingTracker;
        if (existingRaw) {
          try {
            const existing = JSON.parse(existingRaw);
            if (existing?.lastReadVerse?.verseKey) return;
          } catch {
            // ignore and overwrite below
          }
        }

        root.readingTracker = JSON.stringify({
          lastReadVerse,
          recentReadingSessions: {},
        });
        localStorage.setItem(storageKey, JSON.stringify(root));
      } catch {
        // ignore
      }
    },
    { verseKey: '1:1', chapterId: '1', page: '1', hizb: '1' },
  );
};

const buildCacheBustQuery = () =>
  `__prod_product=${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readClientStateDiagnostics = async (page: Page) => {
  return page.evaluate(() => {
    try {
      const observerType = typeof (window as any).quranReaderObserver;
      const verseNodes = document.querySelectorAll('[data-verse-key]').length;
      const { scrollY } = window;

      const raw = localStorage.getItem('persist:root');
      let lastReadVerse: any = null;
      if (raw) {
        const parsed = JSON.parse(raw);
        const sliceRaw = parsed.readingTracker;
        if (sliceRaw) {
          const slice = JSON.parse(sliceRaw);
          lastReadVerse = slice?.lastReadVerse || null;
        }
      }

      return { observerType, verseNodes, scrollY, lastReadVerse };
    } catch (e) {
      return { error: String(e) };
    }
  });
};

const waitForContextMenu = async (page: Page, debug?: DebugCapture) => {
  // The reader ContextMenu isn't rendered until the intersection observer sets the last read verse.
  // On prod this can take a moment; a small scroll reliably triggers it.
  const header = page.getByTestId('header').first();
  if (await header.isVisible().catch(() => false)) return;

  // Wait for verse nodes to attach; without them the intersection observer can't fire.
  const verseNodes = page.locator('[data-verse-key]');
  try {
    await verseNodes.first().waitFor({ state: 'attached', timeout: 15000 });
  } catch {
    // ignore - we'll fall back to timeouts and diagnostics below
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await verseNodes.first().scrollIntoViewIfNeeded();
    } catch {
      // ignore
    }
    await page.mouse.wheel(0, 700);
    if (await header.isVisible().catch(() => false)) return;
    await page.waitForTimeout(250);
  }

  try {
    await header.waitFor({ state: 'visible', timeout: 15000 });
  } catch (e) {
    const [settingsCount, headerCount, verseListCount, htmlLang, url, clientState] =
      await Promise.all([
        page
          .getByTestId('settings-button')
          .count()
          .catch(() => -1),
        page
          .getByTestId('header')
          .count()
          .catch(() => -1),
        page
          .getByTestId('verse-list')
          .count()
          .catch(() => -1),
        page
          .locator('html')
          .getAttribute('lang')
          .catch(() => null),
        Promise.resolve(page.url()),
        readClientStateDiagnostics(page).catch(() => null),
      ]);
    const title = await page.title().catch(() => null);
    const bodyText = await page
      .locator('body')
      .innerText()
      .catch(() => null);
    const snippet = bodyText ? bodyText.replace(/\s+/g, ' ').slice(0, 180) : null;

    // eslint-disable-next-line no-console
    console.log(
      `[prod-product] ContextMenu not visible. url=${url} title=${title} lang=${htmlLang} headers=${headerCount} settingsButtons=${settingsCount} verseList=${verseListCount} clientState=${JSON.stringify(
        clientState,
      )} consoleErrors=${debug?.consoleErrors?.slice(0, 3).join(' | ') || ''} pageErrors=${
        debug?.pageErrors?.slice(0, 2).join(' | ') || ''
      } requestFailures=${debug?.requestFailures?.slice(0, 2).join(' | ') || ''} badStatic=${
        debug?.badStaticResponses?.slice(0, 2).join(' | ') || ''
      } bodySnippet=${snippet}`,
    );
    throw e;
  }
};

const login = async (page: Page) => {
  await loginWithEmail(page, {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
  });
};

const getSelectedTranslations = async (page: Page): Promise<number[]> => {
  const translations = await getPersistedSlice<any>(page, 'translations');
  return translations?.selectedTranslations || [];
};

const getDefaultSettings = async (page: Page) => getPersistedSlice<any>(page, 'defaultSettings');

const applyNewTranslation = async (page: Page): Promise<number> => {
  const id = await selectAnyTranslationPreference(page);
  const parsedId = Number(id);
  await expect
    .poll(async () => (await getSelectedTranslations(page)).includes(parsedId))
    .toBe(true);
  return parsedId;
};

const gotoEnglishReaderPage = async (page: Page, debug?: DebugCapture) => {
  // Force English regardless of runner geography / cached locale redirects.
  await ensureLastReadVerseSeeded(page);
  await setManualLocaleCookies(page, 'en');
  await page.goto(`/en/1?${buildCacheBustQuery()}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  // Ensure we are actually on the Quran Reader (not an interstitial/challenge page).
  try {
    await page.locator('[data-verse-key]').first().waitFor({ state: 'attached', timeout: 60000 });
  } catch (e) {
    const [title, url, htmlLang, bodyText] = await Promise.all([
      page.title().catch(() => null),
      Promise.resolve(page.url()),
      page
        .locator('html')
        .getAttribute('lang')
        .catch(() => null),
      page
        .locator('body')
        .innerText()
        .catch(() => null),
    ]);
    const snippet = bodyText ? bodyText.replace(/\s+/g, ' ').slice(0, 240) : null;
    // eslint-disable-next-line no-console
    console.log(
      `[prod-product] Reader not ready after navigation. url=${url} title=${title} lang=${htmlLang} bodySnippet=${snippet} consoleErrors=${
        debug?.consoleErrors?.slice(0, 2).join(' | ') || ''
      } pageErrors=${debug?.pageErrors?.slice(0, 1).join(' | ') || ''} requestFailures=${
        debug?.requestFailures?.slice(0, 2).join(' | ') || ''
      }`,
    );
    throw e;
  }
  await waitForReduxHydration(page);
  await ensureEnglishLanguage(page);
  await waitForContextMenu(page, debug);
};

const resetSettingsAndReturnToEnglish = async (page: Page, debug?: DebugCapture) => {
  await gotoEnglishReaderPage(page, debug);
  await openSettingsDrawer(page);
  await page.locator('[data-testid="reset-settings-button"]').click();
  await page.waitForTimeout(2000);
  await page.keyboard.press('Escape');

  await expect
    .poll(async () => {
      const settings = await getDefaultSettings(page);
      return settings?.userHasCustomised;
    })
    .toBe(false);

  await ensureEnglishLanguage(page);
  await waitForReduxHydration(page);
};

const fetchCountryLanguagePreference = async (
  request: APIRequestContext,
  { language, country }: { language: string; country: string },
) => {
  const url = `/api/proxy/content/api/qdc/resources/country_language_preference?user_device_language=${language}&country=${country}`;
  const res = await request.get(url, { headers: { accept: 'application/json' } });
  expect(res.ok()).toBe(true);
  return res.json();
};

test.describe('QF-318 (prod) — product regression smoke', () => {
  test.skip(!isProdEdgeBaseUrl(), 'Requires PLAYWRIGHT_TEST_BASE_URL=https://ssr.quran.com');
  test.describe.configure({ mode: 'serial', timeout: 120000 });
  if (process.env.PLAYWRIGHT_STORAGE_STATE) {
    test.use({ storageState: process.env.PLAYWRIGHT_STORAGE_STATE });
  }

  test(
    'Logged-in preference persists across reload',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      test.skip(!hasCreds(), 'Missing TEST_USER_EMAIL/TEST_USER_PASSWORD');

      const debug = attachDebugCapture(page);
      await login(page);
      await gotoEnglishReaderPage(page, debug);

      try {
        const targetId = await applyNewTranslation(page);

        await page.reload({ waitUntil: 'domcontentloaded' });
        await waitForReduxHydration(page);

        const after = await getSelectedTranslations(page);
        expect(after).toContain(targetId);
      } finally {
        await resetSettingsAndReturnToEnglish(page);
      }
    },
  );

  test(
    'Logged-in: language switch preserves customised settings',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      test.skip(!hasCreds(), 'Missing TEST_USER_EMAIL/TEST_USER_PASSWORD');

      const debug = attachDebugCapture(page);
      await login(page);
      await gotoEnglishReaderPage(page, debug);

      try {
        const targetId = await applyNewTranslation(page);

        await selectNavigationDrawerLanguage(page, 'ar');
        await page.waitForURL(/\/ar/);
        await waitForReduxHydration(page);

        const after = await getSelectedTranslations(page);
        expect(after).toContain(targetId);

        const settings = await getDefaultSettings(page);
        expect(settings?.userHasCustomised).toBe(true);
      } finally {
        await resetSettingsAndReturnToEnglish(page);
      }
    },
  );

  test(
    'Logged-in: language switch updates defaults when not customised',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      test.skip(!hasCreds(), 'Missing TEST_USER_EMAIL/TEST_USER_PASSWORD');

      const debug = attachDebugCapture(page);
      await login(page);
      await gotoEnglishReaderPage(page, debug);

      try {
        await resetSettingsAndReturnToEnglish(page, debug);

        await selectNavigationDrawerLanguage(page, 'ar');
        await page.waitForURL(/\/ar/);
        await waitForReduxHydration(page);

        const apiDefaults = await fetchCountryLanguagePreference(page.request, {
          language: 'ar',
          country: 'US',
        });
        const expectedIds = (apiDefaults?.defaultTranslations || []).map((t: any) => t.id);

        const translations = await getSelectedTranslations(page);
        expectedIds.forEach((id: number) => {
          expect(translations).toContain(id);
        });
      } finally {
        await resetSettingsAndReturnToEnglish(page);
      }
    },
  );

  test(
    'Guest: language switch updates defaults when not customised',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      const debug = attachDebugCapture(page);
      await clearAuthAndQdcCookies(page);
      await gotoEnglishReaderPage(page, debug);

      const settings = await getDefaultSettings(page);
      expect(settings?.userHasCustomised).toBe(false);

      await selectNavigationDrawerLanguage(page, 'ar');
      await page.waitForURL(/\/ar/);
      await waitForReduxHydration(page);

      const apiDefaults = await fetchCountryLanguagePreference(page.request, {
        language: 'ar',
        country: 'US',
      });
      const expectedIds = (apiDefaults?.defaultTranslations || []).map((t: any) => t.id);

      const translations = await getSelectedTranslations(page);
      expectedIds.forEach((id: number) => {
        expect(translations).toContain(id);
      });
    },
  );

  test(
    'Guest: language switch preserves customised settings',
    { tag: ['@prod-product'] },
    async ({ page }) => {
      const debug = attachDebugCapture(page);
      await clearAuthAndQdcCookies(page);
      await gotoEnglishReaderPage(page, debug);

      const targetId = await applyNewTranslation(page);

      await selectNavigationDrawerLanguage(page, 'ar');
      await page.waitForURL(/\/ar/);
      await waitForReduxHydration(page);

      const after = await getSelectedTranslations(page);
      expect(after).toContain(targetId);
    },
  );
});
