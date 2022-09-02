import { it, expect } from 'vitest';

import { migrateRecentReadingSessions } from './migrating-recent-reading-sessions';

const previousReadingSessions = {
  '17:1': true,
  '3:3': true,
  '3:2': true,
  '2:2': true,
};

it('should migrate recentReadingSessions to the new format. Using date', () => {
  const now = new Date();
  expect(migrateRecentReadingSessions(previousReadingSessions, now)).toEqual({
    '17:1': now.getTime(),
    '3:3': now.getTime(),
    '3:2': now.getTime(),
    '2:2': now.getTime(),
  });
});
