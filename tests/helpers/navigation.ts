import { expect, type Page } from '@playwright/test';

import { TestId } from '@/tests/test-ids';

export const openNavigationDrawer = async (page: Page): Promise<void> => {
  const navigationDrawer = page.getByTestId(TestId.NAVIGATION_DRAWER);
  if (await navigationDrawer.isVisible()) {
    return;
  }

  await page.getByTestId(TestId.OPEN_NAVIGATION_DRAWER).click();
  await expect(navigationDrawer).toBeVisible();
};

export const openSearchDrawer = async (page: Page): Promise<void> => {
  await page.getByTestId(TestId.OPEN_SEARCH_DRAWER).click();
  await expect(page.getByTestId(TestId.SEARCH_DRAWER_CONTAINER)).toBeVisible();
};

export const openQuranNavigation = async (page: Page): Promise<void> => {
  await page.getByTestId(TestId.NAVIGATE_QURAN_BUTTON).click();
};
