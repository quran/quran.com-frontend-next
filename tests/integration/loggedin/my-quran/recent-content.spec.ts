import { expect, test } from '@playwright/test';

import { clickRecentTab, navigateToVerse } from '@/tests/helpers/my-quran/recent-content';
import { TestId } from '@/tests/test-ids';

test.describe('My Quran - Recent Content (Logged In)', () => {
  test(
    'Shows recent read with correct metadata after reading a verse',
    { tag: ['@slow', '@my-quran', '@recent', '@loggedin', '@metadata'] },
    async ({ page }) => {
      await navigateToVerse(page, '2:255');
      await page.goto('/my-quran', { waitUntil: 'networkidle' });
      await clickRecentTab(page);

      const recentItem = page.getByTestId(TestId.MY_QURAN_RECENT_CONTENT_ITEM).first();
      await expect(recentItem).toBeVisible();
      await expect(recentItem.getByText('Al-Baqarah')).toBeVisible();

      // Wait for metadata to load (useSWR call completes)
      const metadataText = recentItem.getByTestId(TestId.MY_QURAN_RECENT_CONTENT_VERSE_METADATA);
      await expect(metadataText).toBeVisible({ timeout: 5000 });

      const chapterIcon = recentItem.locator('svg, img').first();
      await expect(chapterIcon).toBeVisible();
    },
  );
});
