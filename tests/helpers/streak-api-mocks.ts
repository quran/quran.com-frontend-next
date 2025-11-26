import type { Page } from '@playwright/test';

export const STREAK_API_PATTERN = /\/api\/proxy\/auth\/streak/;

/**
 * Mock streak API response with goal
 */
export const mockStreakWithGoal = (page: Page): void => {
  page.route(STREAK_API_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          goal: {
            id: 'test-goal-id',
            type: 'pages',
            amount: '10',
            progress: {
              percent: 50,
            },
            isCompleted: false,
          },
          streak: 5,
          activityDays: [],
        },
      }),
    });
  });
};

/**
 * Mock streak API response without goal
 */
export const mockStreakWithoutGoal = (page: Page): void => {
  page.route(STREAK_API_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          goal: null,
          streak: 0,
          activityDays: [],
        },
      }),
    });
  });
};
