import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo();
});

test(
  'Language selection persists across sessions and pages',
  { tag: ['@persistence', '@language', '@slow'] },
  async ({ page, context }) => {
    // 1. Open the language selector menu
    await page.getByTestId('language-selector-button-navbar').click();

    // 2. select Spanish and wait for navigation to /es
    await Promise.all([
      page.waitForURL('**/es', { waitUntil: 'networkidle' }),
      page.getByRole('menuitem', { name: 'Español' }).click(),
    ]);

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // 3. Navigate to surah An Naml and make sure we are still on /es/27
    await Promise.all([
      page.waitForURL('**/es/27'),
      page.getByTestId('chapter-27-container').click(),
    ]);
    await expect(page).toHaveURL(/\/es\/27/);

    // 4. Now create a new context and a new page to simulate a new session
    const newPage = await context.newPage();
    await newPage.goto('/');

    // 5. Make sure we are still on the Spanish version of the site (/es)
    await expect(newPage).toHaveURL(/\/es/);
  },
);
