/* eslint-disable no-await-in-loop */
import { expect, type Page } from '@playwright/test';

/**
 * Helper to find and click the "Create My Goal" button in the banner
 */
const clickCreateMyGoalButton = async (page: Page): Promise<void> => {
  // Get only the visible banner to avoid strict mode violations
  const banner = page.getByTestId('banner').and(page.locator(':visible')).first();

  const button = banner.getByLabel('create-my-goal');
  await expect(button).toBeVisible();
  await button.click({ force: true });
};

export default clickCreateMyGoalButton;
