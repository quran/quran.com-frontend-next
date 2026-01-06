import { test, expect } from '@playwright/test';

import Homepage from '../../POM/home-page';

import clickCreateMyGoalButton from '@/tests/helpers/banner';

const READING_GOAL_URL = '/reading-goal';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
  await homepage.goTo('/');
});

test.describe('Banner Test', () => {
  test('should redirect to /reading-goal when user is not logged in', async ({ page }) => {
    homepage.closeNextjsErrorDialog();

    await Promise.all([
      clickCreateMyGoalButton(page),
      // Check that we are redirected to the reading goal page
      expect(page).toHaveURL(new RegExp(READING_GOAL_URL)),
    ]);
  });
});
