import { test, expect } from '@playwright/test';

import { renderWidgetPage } from './widget-helper';

test.describe('Widget - word-by-word translations', () => {
  test('Word-by-word translations are shown when enabled (EN)', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      enableWbw: true,
      locale: 'en',
    });

    await expect(frame.getByText('(with) greetings', { exact: false })).toBeVisible();
  });

  test('Word-by-word translations are shown when enabled (FR)', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '33:56',
      translationIds: '131',
      enableWbw: true,
      locale: 'fr',
    });

    await expect(
      frame.getByText('(avec) demande d’envoi de paix.', { exact: false }),
    ).toBeVisible();
  });
});
