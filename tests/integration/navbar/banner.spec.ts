import { test, expect } from '@playwright/test';

import Homepage from '../../POM/home-page';

import clickBannerCTA from '@/tests/helpers/banner';

const READING_GOAL_URL = '/ramadanchallenge';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
  await homepage.goTo('/');
});

test.describe('Banner Test', () => {
  test('should redirect to /ramadanchallenge when user is not logged in', async ({ page }) => {
    homepage.closeNextjsErrorDialog();

    await Promise.all([
      clickBannerCTA(page),
      // Check that we are redirected to the reading goal page
      expect(page).toHaveURL(new RegExp(READING_GOAL_URL)),
    ]);
  });
});
