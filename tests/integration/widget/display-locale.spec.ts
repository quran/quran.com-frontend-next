import { test, expect } from '@playwright/test';

import { renderWidgetPage } from './widget-helper';

test.describe('Widget - localization', () => {
  test('Header localizes when locale is French', async ({ page }) => {
    await renderWidgetPage(page, {
      ayah: '2:255',
      translationIds: '131',
      locale: 'fr',
    });

    await expect(page.getByText('Sourate Al-Baqarah, Ayah 255', { exact: false })).toBeVisible();
  });
});
