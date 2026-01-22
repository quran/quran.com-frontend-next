import { expect, test } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/76');
});

test(
  'Clickable quran.com logo with homepage redirect',
  { tag: ['@slow', '@navbar'] },
  async ({ page }) => {
    // Click on the quran.com logo of the navbar (the first one, the second is in the drawer)
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
    const pageInfo = page.getByTestId(TestId.PAGE_INFO);
    const pageInfoText = await pageInfo.textContent();
    expect(pageInfoText).toContain('Juz 29');
    expect(pageInfoText).toContain('Hizb 58');
    expect(pageInfoText).toContain('Page 578');

    // Verify surah name
    const currentSurahInfo = page.getByTestId(TestId.CHAPTER_NAVIGATION);
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
    const navBar = page.getByTestId(TestId.NAVBAR);
    const header = page.getByTestId(TestId.HEADER);

    await expect(navBar).toHaveAttribute('data-isvisible', 'true');
    await expect(header).toHaveAttribute('data-isvisible', 'true');

    await page.waitForTimeout(500);

    const isMobile = page.viewportSize()?.width && page.viewportSize()?.width <= 768;

    if (isMobile) {
      // On mobile, use scrollBy instead of mouse.wheel
      await page.evaluate(() => window.scrollBy(0, 200));
    } else {
      await page.mouse.wheel(0, 200);
    }

    await page.waitForTimeout(300); // Wait for scroll animation
    await expect(navBar).toHaveAttribute('data-isvisible', 'false');

    if (isMobile) {
      // Mobile view - the header should collapse to a minimal information one
      await expect(header).toHaveAttribute('data-isvisible', 'false');
    } else {
      // PC view - the header should be fully diplayed
      await expect(header).toHaveAttribute('data-isvisible', 'true');
    }

    if (isMobile) {
      await page.evaluate(() => window.scrollBy(0, -100));
    } else {
      await page.mouse.wheel(0, -100);
    }

    await page.waitForTimeout(300); // Wait for scroll animation
    await expect(navBar).toHaveAttribute('data-isvisible', 'true');
    await expect(header).toHaveAttribute('data-isvisible', 'true');
  },
);
