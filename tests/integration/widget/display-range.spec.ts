import { test, expect } from '@playwright/test';

import { renderWidgetPage } from './widget-helper';

test.describe('Widget - range and headers', () => {
  test('Correct verse numbers are shown for a range', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '2:255',
      rangeEnd: 257,
      translationIds: '131',
      locale: 'en',
    });

    await expect(frame.getByText('255. ', { exact: false })).toBeVisible();
    await expect(frame.getByText('256. ', { exact: false })).toBeVisible();
    await expect(frame.getByText('257. ', { exact: false })).toBeVisible();
  });

  test('Header reflects selected surah/ayah', async ({ page }) => {
    const frame = await renderWidgetPage(page, {
      ayah: '2:255',
      translationIds: '131',
      locale: 'en',
    });

    await expect(frame.getByText('Surah Al-Baqarah, Verse 255', { exact: false })).toBeVisible();
  });
});
