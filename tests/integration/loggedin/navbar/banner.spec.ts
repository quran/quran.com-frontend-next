/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

import clickCreateMyGoalButton from '@/tests/helpers/banner';
import { mockStreakWithGoal, mockStreakWithoutGoal } from '@/tests/helpers/streak-api-mocks';
import switchLanguage from '@/tests/helpers/switch-language';

const READING_GOAL_URL = '/reading-goal';
const READING_GOAL_PROGRESS_URL = '/reading-goal/progress';

test.describe('Banner Test - Logged In User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await switchLanguage(page, 'en');
  });
  test('should redirect to /reading-goal when user is logged in without goal', async ({ page }) => {
    mockStreakWithoutGoal(page);

    await clickCreateMyGoalButton(page);
    await page.waitForURL(new RegExp(`${READING_GOAL_URL}$`));
    expect(new URL(page.url()).pathname).toBe(READING_GOAL_URL);
  });

  test('should redirect to /reading-goal/progress when user is logged in with goal', async ({
    page,
  }) => {
    mockStreakWithGoal(page);

    await clickCreateMyGoalButton(page);
    await page.waitForURL(new RegExp(`${READING_GOAL_PROGRESS_URL}$`));
    expect(new URL(page.url()).pathname).toBe(READING_GOAL_PROGRESS_URL);
  });
});
