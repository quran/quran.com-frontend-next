import { expect, type Page } from '@playwright/test';

/**
 * Helper to find and click the "Create My Goal" button in the banner
 */
const clickCreateMyGoalButton = async (page: Page): Promise<void> => {
  const banner = page.getByTestId('banner');
  const button = banner.getByRole('link', { name: /create my goal/i });
  await expect(button).toBeVisible();
  await button.click();
};

export default clickCreateMyGoalButton;
