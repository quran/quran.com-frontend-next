import { test, expect } from '@playwright/test';

import { openNavigationDrawer } from '@/tests/helpers/navigation';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Navigation drawer icon should open the theme switcher', async ({ page, context }) => {
  const homepage = new Homepage(page, context);
  await homepage.goTo('/1');

  // 1. Make sure the theme switcher is not visible before opening the navigation drawer
  await expect(page.getByTestId(TestId.CHANGE_THEME_BUTTON)).toHaveCount(0);
  // 2. Click the navigation drawer trigger
  await openNavigationDrawer(page);
  // 3. Theme switcher should now be visible
  await expect(page.getByTestId(TestId.CHANGE_THEME_BUTTON)).toBeVisible();

  // 4. Open the theme popover and ensure options are present
  await page.getByTestId(TestId.CHANGE_THEME_BUTTON).click();
  await expect(page.getByTestId('theme-option-light')).toBeVisible();
  await expect(page.getByTestId('theme-option-sepia')).toBeVisible();
  await expect(page.getByTestId('theme-option-dark')).toBeVisible();
});
