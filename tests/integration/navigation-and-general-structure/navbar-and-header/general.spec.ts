import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/76');
});

test(
  'Clickable quran.com logo with homepage redirect',
  { tag: ['@slow', '@navbar'] },
  async ({ page }) => {
    // Click on the quran.com logo of the navbar (the second one, the first is in the drawer)
    const logoElement = page.getByTitle('Quran.com').nth(0);
    await logoElement.click();

    // Make sure we are redirected to the homepage
    await expect(page).toHaveURL('/');
  },
);

test(
  'Breadcrumb navigation accuracy',
  { tag: ['@header', '@fast', '@smoke'] },
  async ({ page }) => {
    // Verify that the breadcrumb below the navbar displays the correct information about the current surah (76)
    // Verify page, hizb and juz number
    const pageInfo = page.getByTestId('page-info');
    const pageInfoText = await pageInfo.textContent();
    expect(pageInfoText).toContain('Juz 29');
    expect(pageInfoText).toContain('Hizb 58');
    expect(pageInfoText).toContain('Page 578');

    // Verify surah name
    const currentSurahInfo = page.getByTestId('chapter-navigation');
    const currentSurahInfoText = await currentSurahInfo.textContent();
    expect(currentSurahInfoText.includes('76. Al-Insan'));
  },
);

test(
  'The navbar and the header should hide on scroll down, and appears on scroll up',
  {
    tag: ['@header', '@nav'],
  },
  async ({ page }) => {
    const navBar = page.getByTestId('navbar');
    const header = page.getByTestId('header');

    await expect(navBar).toHaveAttribute('data-isvisible', 'true');
    await expect(header).toHaveAttribute('data-isvisible', 'true');

    await page.mouse.wheel(0, 200);
    await expect(navBar).toHaveAttribute('data-isvisible', 'false');

    if (page.viewportSize()?.width && page.viewportSize()?.width <= 768) {
      // Mobile view - the header should collapse to a minimal information one
      await expect(header).toHaveAttribute('data-isvisible', 'false');
    } else {
      // PC view - the header should be fully diplayed
      await expect(header).toHaveAttribute('data-isvisible', 'true');
    }

    await page.mouse.wheel(0, -10);
    await expect(navBar).toHaveAttribute('data-isvisible', 'true');
    await expect(header).toHaveAttribute('data-isvisible', 'true');
  },
);
