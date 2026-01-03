import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
});

test('Learning Plans are displayed correctly and navigate to the correct URL', async ({ page }) => {
  await homePage.goTo('/learning-plans');

  const learningPlansSection = page.getByTestId('courses-list');
  await expect(learningPlansSection).toBeVisible();

  // Check that there are at least 3 items in the Learning Plans section
  const items = learningPlansSection.getByRole('link');
  expect(await items.count()).toBeGreaterThanOrEqual(3);

  // Click on the first item
  const firstItem = items.first();
  const firstItemTitle = await firstItem.textContent();
  expect(firstItemTitle).toBeTruthy();
  await firstItem.click();

  // Verify that we navigated to a URL that contains /learning-plans/
  await page.waitForURL(/\/learning-plans\//);
  await expect(page).toHaveURL(/\/learning-plans\/.*/);
});

// TODO: Unskip when PR about QF-3600 is merged
test.skip('loads more courses when scrolling near the end of the list', async ({ page }) => {
  await homePage.goTo('/learning-plans');

  const courseCards = page.locator('a[href^="/learning-plans/"]');
  const initialCourseCount = await courseCards.count();
  expect(initialCourseCount).toBeGreaterThan(0);

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  await expect.poll(async () => courseCards.count()).toBeGreaterThan(initialCourseCount);
});

test(
  'Learning Plans section renders on the homepage without JavaScript',
  { tag: ['@learning-plans', '@ssr', '@homepage'] },
  async ({ browser }) => {
    const ssrContext = await browser.newContext({ javaScriptEnabled: false }); // Disable JS to validate SSR rendering
    const ssrPage = await ssrContext.newPage();

    await ssrPage.goto('/', { waitUntil: 'networkidle' });

    const learningPlansSection = ssrPage.getByTestId('learning-plans-section');
    await expect(learningPlansSection).toBeVisible();
    const items = learningPlansSection.getByRole('link');
    expect(await items.count()).toBeGreaterThan(0);

    await ssrContext.close(); // Clean up the no-JS context
  },
);
