/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import { renderWidgetPage } from './widget-helper';

test.describe('Verse display', () => {
  test(
    'The translation is displayed correctly',
    { tag: ['@widget', '@display'] },
    async ({ page }) => {
      // Render the widget with default params (ayah 33:56, translation 131)
      await renderWidgetPage(page, {
        ayah: '33:56',
        translationIds: '131',
        locale: 'en',
      });

      // Assert the expected translation text is visible
      await expect(
        page.getByText('Indeed, Allah showers His blessings upon the Prophet', { exact: false }),
      ).toBeVisible();
    },
  );

  test(
    'The Arabic text is displayed when enabled',
    { tag: ['@widget', '@display'] },
    async ({ page }) => {
      // Render the widget with Arabic text enabled
      await renderWidgetPage(page, {
        ayah: '33:56',
        translationIds: '131',
        showArabic: true,
        locale: 'en',
      });

      // Assert the expected Arabic text is contained in data-arabic-verse attribute
      const arabicVerse = 'إِنَّ ٱللَّهَ وَمَلَـٰٓئِكَتَهُۥ يُصَلُّونَ عَلَى ٱلنَّبِىِّ ۚ';
      const element = await page.locator('[data-arabic-verse]').first();
      await expect(element).toHaveAttribute(
        'data-arabic-verse',
        expect.stringContaining(arabicVerse),
      );
    },
  );

  test(
    'The arabic text is hidden when disabled',
    { tag: ['@widget', '@display'] },
    async ({ page }) => {
      // Render the widget with Arabic text disabled
      await renderWidgetPage(page, {
        ayah: '33:56',
        translationIds: '131',
        showArabic: false,
        locale: 'en',
      });
      // Assert the Arabic text is not present in the DOM
      const arabicVerse = 'إِنَّ ٱللَّهَ وَمَلَٰٓئِكَتَهُۥ يُصَلُّونَ عَلَى ٱلنَّبِىِّ ۚ';
      const element = await page.locator(`[data-arabic-verse*="${arabicVerse}"]`);
      await expect(element).toHaveCount(0);
    },
  );

  test(
    'The translation is not displayed when no translation IDs are provided',
    { tag: ['@widget', '@display'] },
    async ({ page }) => {
      // Render the widget with no translation IDs
      await renderWidgetPage(page, {
        ayah: '33:56',
        translationIds: '',
        locale: 'en',
      });

      // Assert that no translation text is present in the DOM
      const translationText = 'Indeed, Allah showers His blessings upon the Prophet';
      const element = await page.locator(`[data-translation-text*="${translationText}"]`);
      await expect(element).toHaveCount(0);
    },
  );

  test('Selecting multiple translations displays all of them', async ({ page }) => {
    // Render the widget with two translation IDs
    await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131,31',
      locale: 'en',
    });

    // Assert that both translations are visible
    await expect(
      page.getByText('Indeed, Allah showers His blessings upon the Prophet', { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText('Certes, Allah et Ses Anges prient sur le Prophète;', { exact: false }),
    ).toBeVisible();
  });

  test('Translator names are displayed when enabled', async ({ page }) => {
    // Render the widget with translator names enabled
    await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      showTranslatorNames: true,
      locale: 'en',
    });

    // Assert that the translator name is visible
    await expect(page.getByText('Dr. Mustafa Khattab, The Clear Quran')).toBeVisible();
  });

  test('Translator names are hidden when disabled', async ({ page }) => {
    // Render the widget with translator names disabled
    await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      showTranslatorNames: false,
      locale: 'en',
    });

    // Assert that the translator name is not present in the DOM
    const translatorName = 'Dr. Mustafa Khattab, The Clear Quran';
    const element = await page.locator(`[data-translation-text*="${translatorName}"]`);
    await expect(element).toHaveCount(0);
  });

  test('Correct verse number is shown for multiple verses', async ({ page }) => {
    // Render the widget for a range of verses
    await renderWidgetPage(page, {
      ayah: '2:255',
      rangeEnd: 257,
      translationIds: '131',
      locale: 'en',
    });

    // Assert that the verse numbers are correctly displayed
    await expect(page.getByText('255. ', { exact: false })).toBeVisible();
    await expect(page.getByText('256. ', { exact: false })).toBeVisible();
    await expect(page.getByText('257. ', { exact: false })).toBeVisible();
  });

  test('Correct header is shown for the selected surah', async ({ page }) => {
    // Render the widget for Surah Al-Baqarah (2)
    await renderWidgetPage(page, {
      ayah: '2:255',
      translationIds: '131',
      locale: 'en',
    });

    // Assert that the header contains "Surah Al-Baqarah, Verse 255"
    await expect(page.getByText('Surah Al-Baqarah, Verse 255', { exact: false })).toBeVisible();
  });

  test('Localization is applied correctly', async ({ page }) => {
    // Render the widget for Surah Al-Baqarah (2)
    await renderWidgetPage(page, {
      ayah: '2:255',
      translationIds: '131',
      locale: 'fr',
    });

    // Assert that the header contains "Sourate Al-Baqarah, Verset 255"
    await expect(page.getByText('Sourate Al-Baqarah, Ayah 255', { exact: false })).toBeVisible();
  });

  test('Correct Arabic mushaf style is applied (QPC Uthmani Hafs)', async ({ page }) => {
    // Render the widget with a different mushaf style
    await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      mushaf: 'qpc', // QPC Uthmani Hafs
      locale: 'en',
    });

    // Widget should contain "تَسۡلِيمًا"
    await expect(page.getByText('تَسۡلِيمًا', { exact: false })).toBeVisible();
  });

  test('Correct Arabic mushaf style is applied (King Fahad v1)', async ({ page }) => {
    // Render the widget with a different mushaf style
    await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      mushaf: 'kfgqpc_v1', // King Fahad v1
      locale: 'en',
    });

    // Widget should contain "ﭿ" (the specific glyph used in King Fahad font)
    await expect(page.getByText('ﭿ', { exact: false })).toBeVisible();
  });

  test('Correct Arabic mushaf style is applied (King Fahad v2)', async ({ page }) => {
    // Render the widget with a different mushaf style
    await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      mushaf: 'kfgqpc_v2', // King Fahad v2
      locale: 'en',
    });

    // Widget should contain "ﱯ" (the specific glyph used in King Fahad font)
    await expect(page.getByText('ﱯ', { exact: false })).toBeVisible();
  });

  test('Correct Arabic mushaf style is applied (Tajweed)', async ({ page }) => {
    // Render the widget with a different mushaf style
    await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      mushaf: 'tajweed', // Tajweed
      locale: 'en',
    });

    // Widget should contain "ﱯ"
    await expect(page.getByText('ﱯ', { exact: false })).toBeVisible();
  });

  test('Word-by-word translations are displayed when enabled', async ({ page }) => {
    // Render the widget with word-by-word translations enabled
    await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      enableWbw: true,
      locale: 'en',
    });

    // Assert that "(with) greetings" is visible (a word-by-word translation)
    await expect(page.getByText('(with) greetings', { exact: false })).toBeVisible();
  });

  test('Word-by-word translations are displayed when enabled with correct language', async ({
    page,
  }) => {
    // Render the widget with word-by-word translations enabled
    await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      enableWbw: true,
      locale: 'fr',
    });

    // Assert that "(avec) demande d’envoi de paix." is visible (a word-by-word translation)
    await expect(page.getByText('(avec) demande d’envoi de paix.', { exact: false })).toBeVisible();
  });
});
