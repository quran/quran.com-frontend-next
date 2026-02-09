import { test, expect } from '@playwright/test';

import { renderWidgetPage } from './widget-helper';

test.describe('Widget - word-by-word transliteration', () => {
  test('Word-by-word transliteration is shown when enabled', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '1:1',
      translationIds: '131',
      enableWbwTransliteration: true,
      locale: 'en',
    });

    // Verify transliteration text is visible for Surah Al-Fatiha verse 1
    // Expected transliterations: "bis'mi", "l-lahi", "l-raḥmāni", "l-raḥīmi"
    await expect(frame.getByText("bis'mi", { exact: false })).toBeVisible();
    await expect(frame.getByText('l-lahi', { exact: false })).toBeVisible();
  });

  test('Word-by-word transliteration is hidden when disabled', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '1:1',
      translationIds: '131',
      enableWbwTransliteration: false,
      locale: 'en',
    });

    // Verify transliteration text is NOT visible when disabled
    await expect(frame.getByText("bis'mi", { exact: true })).not.toBeVisible();
  });

  test('Both WBW translation and transliteration can be enabled together', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '1:1',
      translationIds: '131',
      enableWbw: true,
      enableWbwTransliteration: true,
      locale: 'en',
    });

    // Verify both transliteration and translation are visible
    // Transliteration
    await expect(frame.getByText("bis'mi", { exact: false })).toBeVisible();
    // Translation (In the name)
    await expect(frame.getByText('In (the) name', { exact: false })).toBeVisible();
  });
});
