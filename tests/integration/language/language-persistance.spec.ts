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
    // 1. Click on the menu
    await page.getByTestId('open-navigation-drawer').click();
    // 2. Click on the language selector nav bar trigger
    await page.getByTestId('language-selector-button').click();
    // 3. Grab the language container
    const languageContainer = page.getByTestId('language-container');

    // 4. select Spanish and wait for navigation to /es
    await Promise.all([
      languageContainer.getByRole('button', { name: 'Español' }).click(),
      page.waitForURL('**/es', { waitUntil: 'networkidle' }),
    ]);

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // 5. Navigate to surah An Naml and make sure we are still on /es/27
    await Promise.all([
      page.waitForURL('**/es/27'),
      page.getByTestId('chapter-27-container').click(),
    ]);
    await expect(page).toHaveURL(/\/es\/27/);

    // 6. Now create a new context and a new page to simulate a new session
    const newPage = await context.newPage();
    await newPage.goto('/');

    // 7. Make sure we are still on the Spanish version of the site (/es)
    await expect(newPage).toHaveURL(/\/es/);
  },
);
