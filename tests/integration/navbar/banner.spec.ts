/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import clickCreateMyGoalButton from '@/tests/helpers/banner';

const READING_GOAL_URL = '/reading-goal';

test.describe('Banner Test', () => {
  test('should redirect to /reading-goal when user is not logged in', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await clickCreateMyGoalButton(page);
    await page.waitForURL(new RegExp(`${READING_GOAL_URL}$`));
    expect(new URL(page.url()).pathname).toBe(READING_GOAL_URL);
  });
});
