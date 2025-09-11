import { test, expect } from '@playwright/test';

test('opening a surah displays its first verse', async ({ page }) => {
  await page.goto('/1');
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toContainText('Al-Fatihah');
  await expect(page.locator('[data-verse-key="1:1"]')).toBeVisible();
});
