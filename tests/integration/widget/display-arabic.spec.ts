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

    const arabicVerse = 'إِنَّ ٱللَّهَ وَمَلَـٰٓئِكَتَهُۥ يُصَلُّونَ عَلَى ٱلنَّبِىِّ ۚ';
    const element = await frame.locator('[data-arabic-verse]').first();
    await expect(element).toHaveAttribute(
      'data-arabic-verse',
      expect.stringContaining(arabicVerse),
    );
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

      const arabicVerse = 'إِنَّ ٱللَّهَ وَمَلَـٰٓئِكَتَهُۥ يُصَلُّونَ عَلَى ٱلنَّبِىِّ ۚ';
      await expect(frame.locator(`[data-arabic-verse*="${arabicVerse}"]`)).toHaveCount(0);
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

    await expect(frame.locator('[data-verse-text]')).toContainText('۟');
  });

  test('IndoPak mushaf renders ayah marker for verse 2', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '1:2',
      translationIds: '131',
      mushaf: 'indopak',
      locale: 'en',
    });

    await expect(frame.locator('[data-verse-text]')).toContainText('۟ۙ');
  });
});
