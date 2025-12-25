/* eslint-disable @typescript-eslint/naming-convention */
import { Page } from '@playwright/test';

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
  targetId?: string;
  scriptSrc?: string;
  extraAttributes?: Record<string, string | number | boolean | undefined>;
};

/**
 * Render a standalone page with the embed widget injected via script tag.
 *
 * @param {Page} page - Playwright page instance.
 * @param {WidgetParams} params - Widget configuration to pass as data-* attributes.
 * @returns {Promise<void>} Resolves after the HTML is set (widget render still async).
 */
export const renderWidgetPage = async (page: Page, params: WidgetParams = {}) => {
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
    targetId = 'quran-embed-1',
    scriptSrc = 'http://localhost:3005/embed/quran-embed.js',
    extraAttributes = {},
  } = params;

  // Build data-* attributes for the script tag
  const attrs: Record<string, string> = {
    'data-quran-target': targetId,
    'data-quran-ayah': ayah,
    'data-quran-translation-ids': translationIds,
    'data-quran-locale': locale,
    'data-quran-reciter-id': reciterId === null ? '' : String(reciterId),
    'data-quran-audio': String(enableAudio),
    'data-quran-word-by-word': String(enableWbw),
    'data-quran-theme': theme,
    'data-quran-mushaf': mushaf,
    'data-quran-show-translator-names': String(showTranslatorNames),
    'data-quran-show-arabic': String(showArabic),
    'data-quran-show-tafsirs': String(showTafsirs),
    'data-quran-show-reflections': String(showReflections),
    'data-quran-show-answers': String(showAnswers),
  };
  if (rangeEnd !== undefined) {
    attrs['data-quran-range-end'] = String(rangeEnd);
  }
  if (width) attrs['data-width'] = width;
  if (height) attrs['data-height'] = height;
  Object.entries(extraAttributes).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    attrs[`data-quran-${key}`] = String(value);
  });

  const attrsString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n  ');

  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <div style="width: 50%; margin: 0 auto;">
      <div id="${targetId}"></div>
    </div>
    <script
      src="${scriptSrc}"
      ${attrsString}
      async>
    </script>
  </body>
</html>`;

  await page.setContent(html);

  // Wait for widget to finish loading
  await page.waitForSelector('[data-verse-block]', {
    timeout: 15000,
  });
};

export default renderWidgetPage;
