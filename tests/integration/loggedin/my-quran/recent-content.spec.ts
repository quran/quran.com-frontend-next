import { expect, test } from '@playwright/test';

import { clickRecentTab, navigateToVerse } from '@/tests/helpers/my-quran/recent-content';
import TEST_IDS from '@/utils/test-ids';

test.describe('My Quran - Recent Content (Logged In)', () => {
  test(
    'Shows recent read with correct metadata after reading a verse',
    { tag: ['@slow', '@my-quran', '@recent', '@loggedin', '@metadata'] },
    async ({ page }) => {
      await navigateToVerse(page, '2:255');
      await page.goto('/my-quran', { waitUntil: 'networkidle' });
      await clickRecentTab(page);

      const recentItem = page
        .getByTestId(TEST_IDS.MY_QURAN.RECENT_CONTENT.RECENT_CONTENT_ITEM)
        .first();
      await expect(recentItem).toBeVisible();
      await expect(recentItem.getByText('Al-Baqarah')).toBeVisible();

      // Wait for metadata to load (useSWR call completes)
      await expect(recentItem.getByText(/Page \d+/i)).toBeVisible({ timeout: 5000 });

      const metadataText = await recentItem.textContent();
      expect(metadataText).toMatch(/Page \d+/i);
      expect(metadataText).toMatch(/Juz \d+/i);
      expect(metadataText).toMatch(/Hizb \d+/i);
      expect(metadataText).toContain(new Date().getFullYear().toString());

      const chapterIcon = recentItem.locator('svg, img').first();
      await expect(chapterIcon).toBeVisible();
    },
  );
});
