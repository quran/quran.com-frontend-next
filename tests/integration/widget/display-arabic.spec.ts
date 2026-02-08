/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import { renderWidgetPage } from './widget-helper';

test.describe('Widget - Arabic text', () => {
  test('Arabic text is shown when enabled', { tag: ['@widget', '@display'] }, async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      showArabic: true,
      locale: 'en',
    });

    const arabicVerse = 'وَمَلَٰٓئِكَتَهُۥ';
    // Use data-verse-key selector which exists in VerseText component
    const element = await frame.locator('[data-testid="verse-arabic-33:56"]').first();
    await expect(element).toContainText(arabicVerse);
  });

  test(
    'Arabic text is hidden when disabled',
    { tag: ['@widget', '@display'] },
    async ({ page }) => {
      const frame = await renderWidgetPage(page, {
        ayah: '33:56',
        translationIds: '131',
        showArabic: false,
        locale: 'en',
      });

      // Check that the Arabic text specifically doesn't exist when Arabic is disabled
      // Use data-testid which targets the Arabic text container specifically
      await expect(frame.locator('[data-testid="verse-arabic-33:56"]')).toHaveCount(0);
    },
  );

  test('Mushaf style - QPC Uthmani Hafs', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      mushaf: 'qpc',
      locale: 'en',
    });

    await expect(frame.getByText('تَسۡلِيمًا', { exact: false })).toBeVisible();
  });

  test('Mushaf style - King Fahad v1', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      mushaf: 'kfgqpc_v1',
      locale: 'en',
    });

    await expect(frame.getByText('ﭿ', { exact: false })).toBeVisible();
  });

  test('Mushaf style - King Fahad v2', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      mushaf: 'kfgqpc_v2',
      locale: 'en',
    });

    await expect(frame.getByText('ﱯ', { exact: false })).toBeVisible();
  });

  test('Mushaf style - Tajweed', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      mushaf: 'tajweed',
      locale: 'en',
    });

    await expect(frame.getByText('ﱯ', { exact: false })).toBeVisible();
  });

  test('IndoPak mushaf renders ayah marker for verse 1', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '1:1',
      translationIds: '131',
      mushaf: 'indopak',
      locale: 'en',
    });

    // Check for IndoPak ayah marker in the Arabic text container
    // Use data-testid to ensure we are checking the Arabic text
    await expect(frame.locator('[data-testid="verse-arabic-1:1"]')).toContainText('۟');
  });

  test('IndoPak mushaf renders ayah marker for verse 2', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '1:2',
      translationIds: '131',
      mushaf: 'indopak',
      locale: 'en',
    });

    // Check for IndoPak ayah marker in the Arabic text container
    await expect(frame.locator('[data-testid="verse-arabic-1:2"]')).toContainText('۟ۙ');
  });
});
