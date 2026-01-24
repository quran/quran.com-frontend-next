import { test, expect } from '@playwright/test';

import { selectNavigationDrawerLanguage } from '@/tests/helpers/language';
import Homepage from '@/tests/POM/home-page';
import { getChapterContainerTestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test(
  'Language selection persists across sessions and pages',
  { tag: ['@persistence', '@language', '@slow'] },
  async ({ page, context }) => {
    // 1. Click on the menu
    await homePage.closeNextjsErrorDialog();
    // 2. select Spanish and wait for navigation to /es
    await Promise.all([
      selectNavigationDrawerLanguage(page, 'es'),
      page.waitForURL('**/es', { waitUntil: 'networkidle' }),
    ]);

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await homePage.hideNextJSOverlay();

    // 5. Navigate to surah An Naml and make sure we are still on /es/27
    await Promise.all([
      page.waitForURL('**/es/27'),
      page.getByTestId(getChapterContainerTestId(27)).click(),
    ]);
    await expect(page).toHaveURL(/\/es\/27/);

    // 6. Now create a new context and a new page to simulate a new session
    const newPage = await context.newPage();
    await newPage.goto('/');

    // 7. Make sure we are still on the Spanish version of the site (/es)
    await expect(newPage).toHaveURL(/\/es/);
  },
);
