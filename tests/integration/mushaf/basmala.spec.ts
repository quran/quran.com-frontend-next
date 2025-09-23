import { test, expect } from '@playwright/test';

import QuranPage from '@/tests/POM/mushaf-mode';

test('the basmala is not shown for surah 1 and 9 (translation mode)', async ({ page }) => {
  await page.goto('/1', { waitUntil: 'networkidle' });

  await expect(page.getByTestId('bismillah-section')).not.toBeVisible();

  await page.goto('/9', { waitUntil: 'networkidle' });

  await expect(page.getByTestId('bismillah-section')).not.toBeVisible();
});

test('the basmala is shown for other surahs (translation mode)', async ({ page }) => {
  await page.goto('/2', { waitUntil: 'networkidle' });

  await expect(page.getByTestId('bismillah-section')).toBeVisible();
});

test('the basmala is shown for every surah except 1 and 9 (mushaf mode)', async ({
  page,
  isMobile,
}) => {
  // Surah 76 - has basmala
  await page.goto('/76', { waitUntil: 'networkidle' });

  // Enable mushaf mode
  const qp = new QuranPage(page);
  await qp.mushafMode(isMobile);

  await expect(page.getByTestId('bismillah-section')).toBeVisible();

  // Surah 1 - no basmala
  await page.goto('/1', { waitUntil: 'networkidle' });
  await expect(page.getByTestId('bismillah-section')).not.toBeVisible();

  // Go to Surah 9 - no basmala
  await page.goto('/9', { waitUntil: 'networkidle' });
  await expect(page.getByTestId('bismillah-section')).not.toBeVisible();
});
