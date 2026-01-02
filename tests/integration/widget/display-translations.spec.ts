/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import { renderWidgetPage } from './widget-helper';

test.describe('Widget - translations', () => {
  test('Translation is displayed', { tag: ['@widget', '@display'] }, async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      locale: 'en',
    });

    await expect(
      frame.getByText('Indeed, Allah showers His blessings upon the Prophet', { exact: false }),
    ).toBeVisible();
  });

  test('No translations when IDs are empty', { tag: ['@widget', '@display'] }, async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '',
      locale: 'en',
    });

    const translationText = 'Indeed, Allah showers His blessings upon the Prophet';
    await expect(frame.locator(`[data-translation-text*="${translationText}"]`)).toHaveCount(0);
  });

  test('Multiple translations are shown', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131,31',
      locale: 'en',
    });

    await expect(
      frame.getByText('Indeed, Allah showers His blessings upon the Prophet', { exact: false }),
    ).toBeVisible();
    await expect(
      frame.getByText('Certes, Allah et Ses Anges prient sur le Prophète;', { exact: false }),
    ).toBeVisible();
  });

  test('Translator names can be toggled on', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      showTranslatorNames: true,
      locale: 'en',
    });

    await expect(frame.getByText('Dr. Mustafa Khattab, The Clear Quran')).toBeVisible();
  });

  test('Translator names can be toggled off', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      showTranslatorNames: false,
      locale: 'en',
    });

    const translatorName = 'Dr. Mustafa Khattab, The Clear Quran';
    await expect(frame.locator(`[data-translation-text*="${translatorName}"]`)).toHaveCount(0);
  });
});
