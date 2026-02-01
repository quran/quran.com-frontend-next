import { test, expect } from '@playwright/test';

import clickBannerCTA from '@/tests/helpers/banner';
import { mockStreakWithGoal, mockStreakWithoutGoal } from '@/tests/helpers/streak-api-mocks';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.describe('Banner Test - Logged In User', () => {
  test.beforeEach(async ({ page, context }) => {
    // Skip all tests if MSW is not enabled
    test.skip(
      !process.env.MSW_ENABLED || process.env.MSW_ENABLED === 'false',
      'MSW must be enabled for these tests',
    );

    homePage = new Homepage(page, context);
    await homePage.goTo();
  });

  test('should redirect to /ramadanchallenge when user is logged in without goal', async ({
    page,
  }) => {
    mockStreakWithoutGoal(page);

    await clickBannerCTA(page);
    await page.waitForURL(/^.*?(\/[a-z]{2})?\/ramadanchallenge$/);
    expect(new URL(page.url()).pathname).toMatch(/^(\/[a-z]{2})?\/ramadanchallenge$/);
  });

  test('should redirect to /ramadanchallenge when user is logged in with goal', async ({
    page,
  }) => {
    mockStreakWithGoal(page);

    await clickBannerCTA(page);
    await page.waitForURL(/^.*?(\/[a-z]{2})?\/ramadanchallenge$/);
    expect(new URL(page.url()).pathname).toMatch(/^(\/[a-z]{2})?\/ramadanchallenge$/);
  });
});
