/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import { renderWidgetPage } from './widget-helper';

test.describe('Widget - Copy Action', () => {
  test.describe('Copy data structure', () => {
    test(
      'Widget has data-copy-data attribute with verse data',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          translationIds: '131',
          showArabic: true,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');

        expect(copyDataAttr).toBeTruthy();
        const copyData = JSON.parse(copyDataAttr!);
        expect(copyData.verses).toBeDefined();
        expect(copyData.verses).toHaveLength(1);
        expect(copyData.mergeVerses).toBe(false);
      },
    );

    test(
      'Copy data contains Arabic text using textUthmani (not glyphs)',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          translationIds: '131',
          showArabic: true,
          mushaf: 'qpc',
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        // Should contain actual Arabic text, not font glyphs
        expect(copyData.verses[0].arabicText).toContain('بِسْمِ');
        expect(copyData.verses[0].arabicText).toContain('ٱللَّهِ');
      },
    );

    test('Copy data includes verse number', { tag: ['@widget', '@copy'] }, async ({ page }) => {
      const frame = await renderWidgetPage(page, {
        ayah: '1:2',
        translationIds: '131',
        showArabic: true,
        locale: 'en',
      });

      const widget = frame.locator('.quran-widget');
      const copyDataAttr = await widget.getAttribute('data-copy-data');
      const copyData = JSON.parse(copyDataAttr!);

      expect(copyData.verses[0].verseNumber).toBe(2);
    });

    test('Copy data includes translation text', { tag: ['@widget', '@copy'] }, async ({ page }) => {
      const frame = await renderWidgetPage(page, {
        ayah: '1:1',
        translationIds: '131',
        locale: 'en',
      });

      const widget = frame.locator('.quran-widget');
      const copyDataAttr = await widget.getAttribute('data-copy-data');
      const copyData = JSON.parse(copyDataAttr!);

      expect(copyData.verses[0].translations).toHaveLength(1);
      expect(copyData.verses[0].translations[0].text).toContain('Compassionate');
    });
  });

  test.describe('Merge verses mode', () => {
    test(
      'mergeVerses is true in copy data when enabled with range',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          rangeEnd: 2,
          translationIds: '131',
          showArabic: true,
          mergeVerses: true,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        expect(copyData.mergeVerses).toBe(true);
        expect(copyData.verses).toHaveLength(2);
      },
    );

    test(
      'mergeVerses is false when disabled even with range',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          rangeEnd: 2,
          translationIds: '131',
          showArabic: true,
          mergeVerses: false,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        expect(copyData.mergeVerses).toBe(false);
      },
    );

    test(
      'Range of verses includes all verse data with correct verse numbers',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          rangeEnd: 3,
          translationIds: '131',
          showArabic: true,
          mergeVerses: true,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        expect(copyData.verses).toHaveLength(3);
        expect(copyData.verses[0].verseNumber).toBe(1);
        expect(copyData.verses[1].verseNumber).toBe(2);
        expect(copyData.verses[2].verseNumber).toBe(3);

        // Each verse should have Arabic text
        expect(copyData.verses[0].arabicText).toBeTruthy();
        expect(copyData.verses[1].arabicText).toBeTruthy();
        expect(copyData.verses[2].arabicText).toBeTruthy();
      },
    );

    test(
      'Merged mode - verse 1 contains Bismillah',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          rangeEnd: 2,
          translationIds: '131',
          showArabic: true,
          mergeVerses: true,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        // First verse should be Bismillah
        expect(copyData.verses[0].arabicText).toContain('بِسْمِ');
        expect(copyData.verses[0].arabicText).toContain('ٱلرَّحْمَـٰنِ');
        expect(copyData.verses[0].arabicText).toContain('ٱلرَّحِيمِ');
      },
    );

    test(
      'Merged mode - verse 2 contains Alhamdulillah',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          rangeEnd: 2,
          translationIds: '131',
          showArabic: true,
          mergeVerses: true,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        // Second verse should be Alhamdulillah
        expect(copyData.verses[1].arabicText).toContain('ٱلْحَمْدُ');
      },
    );

    test(
      'Non-merged mode - each verse has its own Arabic text block',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          rangeEnd: 2,
          translationIds: '131',
          showArabic: true,
          mergeVerses: false,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        // Each verse is separate
        expect(copyData.verses[0].verseNumber).toBe(1);
        expect(copyData.verses[0].arabicText).toContain('بِسْمِ');

        expect(copyData.verses[1].verseNumber).toBe(2);
        expect(copyData.verses[1].arabicText).toContain('ٱلْحَمْدُ');

        // Arabic text should NOT contain the other verse's content
        expect(copyData.verses[0].arabicText).not.toContain('ٱلْحَمْدُ');
        expect(copyData.verses[1].arabicText).not.toContain('بِسْمِ');
      },
    );

    test(
      'Merged mode - translations have correct content',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          rangeEnd: 2,
          translationIds: '131',
          showArabic: true,
          showTranslatorNames: true,
          mergeVerses: true,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        // First verse translation
        expect(copyData.verses[0].translations[0].text).toContain('Compassionate');

        // Second verse translation
        expect(copyData.verses[1].translations[0].text).toContain('Lord');
      },
    );
  });

  test.describe('Translator name', () => {
    test(
      'Translator name is included when showTranslatorNames is true',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          translationIds: '131',
          showTranslatorNames: true,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        expect(copyData.verses[0].translations[0].translatorName).toBeTruthy();
        expect(copyData.verses[0].translations[0].translatorName).toContain('Khattab');
      },
    );

    test(
      'Translator name is undefined when showTranslatorNames is false',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          translationIds: '131',
          showTranslatorNames: false,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        expect(copyData.verses[0].translations[0].translatorName).toBeUndefined();
      },
    );
  });

  test.describe('Arabic text visibility', () => {
    test(
      'Arabic text is empty when showArabic is false',
      { tag: ['@widget', '@copy'] },
      async ({ page }) => {
        const frame = await renderWidgetPage(page, {
          ayah: '1:1',
          translationIds: '131',
          showArabic: false,
          locale: 'en',
        });

        const widget = frame.locator('.quran-widget');
        const copyDataAttr = await widget.getAttribute('data-copy-data');
        const copyData = JSON.parse(copyDataAttr!);

        expect(copyData.verses[0].arabicText).toBe('');
      },
    );
  });

  test.describe('Copy button', () => {
    test('Copy button exists in the widget', { tag: ['@widget', '@copy'] }, async ({ page }) => {
      const frame = await renderWidgetPage(page, {
        ayah: '1:1',
        translationIds: '131',
        locale: 'en',
      });

      const copyButton = frame.locator('[data-copy-verse]');
      await expect(copyButton).toBeVisible();
    });
  });
});
