import { test, expect } from '@playwright/test';

test.describe('Embed builder aliases', () => {
  test(
    'Renders the builder page at /embed/ayah',
    { tag: ['@widget'] },
    async ({ page, isMobile }) => {
      test.skip(isMobile);

      await page.goto('/embed/ayah', { waitUntil: 'networkidle' });

      const widgetFrame = page.frameLocator('iframe');
      await expect(widgetFrame.locator('.quran-widget')).toBeVisible();
    },
  );
});
