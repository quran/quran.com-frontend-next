/* eslint-disable no-await-in-loop */
import { expect, type Page } from '@playwright/test';

import { TestId } from '@/tests/test-ids';

/**
 * Helper to click the CTA button in the banner
 */
const clickBannerCTA = async (page: Page): Promise<void> => {
  // Target the visible banner instance (there are two in the navbar).
  const banner = page.locator(`[data-testid="${TestId.BANNER}"]:visible`).first();
  const button = banner.getByRole('link');
  await expect(button).toBeVisible();
  await button.click({ force: true });
};

export default clickBannerCTA;
