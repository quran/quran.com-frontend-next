/* eslint-disable @typescript-eslint/naming-convention */
import type { FrameLocator, Page } from '@playwright/test';

type WidgetParams = {
  ayah?: string;
  rangeEnd?: number | string;
  translationIds?: string;
  reciterId?: string | number | null;
  enableAudio?: boolean;
  enableWbw?: boolean;
  theme?: string;
  mushaf?: string;
  showTranslatorNames?: boolean;
  showArabic?: boolean;
  showTafsirs?: boolean;
  showReflections?: boolean;
  showAnswers?: boolean;
  locale?: string;
  width?: string;
  height?: string;
  mergeVerses?: boolean;
  targetId?: string;
  scriptSrc?: string;
  hostUrl?: string;
  extraAttributes?: Record<string, string | number | boolean | undefined>;
};

/**
 * Render a standalone page with the embed widget inside an iframe.
 *
 * @param {Page} page - Playwright page instance.
 * @param {WidgetParams} params - Widget configuration to pass as data-* attributes.
 * @returns {Promise<FrameLocator>} Frame locator for the widget iframe.
 */
export const renderWidgetPage = async (
  page: Page,
  params: WidgetParams = {},
): Promise<FrameLocator> => {
  const {
    ayah = '33:56',
    translationIds = '131',
    reciterId = 7,
    enableAudio = true,
    enableWbw = false,
    theme = 'light',
    mushaf = 'qpc',
    showTranslatorNames = false,
    showArabic = true,
    showTafsirs = true,
    showReflections = true,
    showAnswers = true,
    locale = 'en',
    rangeEnd,
    width,
    height,
    mergeVerses = false,
    scriptSrc = 'http://localhost:3005/embed/v1',
    hostUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3005',
    extraAttributes = {},
  } = params;

  const mapTheme = (value: string) => (value === 'dark' ? 'dark' : 'light');
  const mapFont = (value: string) => {
    switch (value) {
      case 'kfgqpc_v1':
        return 'v1';
      case 'indopak':
        return 'indopak';
      case 'tajweed':
        return 'uthmani';
      case 'kfgqpc_v2':
        return 'v2';
      case 'qpc':
      default:
        return 'uthmani';
    }
  };

  const [chapterPart, versePart] = ayah.split(':');
  const startVerse = Number(versePart?.split('-')[0]);
  const versesParam =
    rangeEnd && Number.isFinite(Number(rangeEnd)) && Number(rangeEnd) > startVerse
      ? `${chapterPart}:${startVerse}-${rangeEnd}`
      : ayah;

  const url = new URL(scriptSrc);
  url.searchParams.set('verses', versesParam);
  if (translationIds) url.searchParams.set('translations', translationIds);
  url.searchParams.set('audio', String(enableAudio));
  if (reciterId !== null) url.searchParams.set('reciter', String(reciterId));
  url.searchParams.set('theme', mapTheme(theme));
  url.searchParams.set('font', mapFont(mushaf));
  url.searchParams.set('mushaf', mushaf);
  url.searchParams.set('locale', locale);
  url.searchParams.set('wbw', String(enableWbw));
  url.searchParams.set('showTranslationName', String(showTranslatorNames));
  url.searchParams.set('showArabic', String(showArabic));
  url.searchParams.set('tafsir', String(showTafsirs));
  url.searchParams.set('reflections', String(showReflections));
  url.searchParams.set('answers', String(showAnswers));
  url.searchParams.set('mergeVerses', String(mergeVerses));
  Object.entries(extraAttributes).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });

  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <div style="width: 50%; margin: 0 auto;">
      <iframe
        src="${url.toString()}"
        width="${width || '100%'}"
        height="${height || '500'}"
        frameborder="0"
      ></iframe>
    </div>
  </body>
</html>`;

  // Ensure the page has an http(s) origin so the iframe passes frame-ancestors checks.
  await page.goto(hostUrl, { waitUntil: 'domcontentloaded' });
  await page.setContent(html);

  const frameLocator = page.frameLocator('iframe');
  await frameLocator.locator('.quran-widget').waitFor({ timeout: 15000, state: 'visible' });

  return frameLocator;
};

export default renderWidgetPage;
