import { expect, test } from '@playwright/test';

import themeOptions from '@/tests/mocks/themes';
import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test('Theme selector in the footer works', { tag: ['@footer', '@theme'] }, async ({ page }) => {
  const footer = page.locator('footer');
  const themeSelector = footer.getByTestId(TestId.THEME_SWITCHER);
  await expect(themeSelector).toBeVisible();

  await themeSelector.click();
  await Promise.all(
    themeOptions.map(async (theme) => {
      await expect(page.getByRole('menuitem', { name: theme })).toBeVisible();
    }),
  );
});
