import { it, expect } from 'vitest';

import { toLocalizedNumber, toLocalizedMonthName } from './locale';

it('toLocalizedNumber works as expected', () => {
  expect(toLocalizedNumber(9, 'en', true)).toBe('09');
  expect(toLocalizedNumber(10, 'en', true)).toBe('10');
  expect(toLocalizedNumber(9, 'en')).toBe('9');
});

it('toLocalizedMonthName works as expected', () => {
  expect(toLocalizedMonthName(2, 'en')).toBe('February');
  expect(toLocalizedMonthName(2, 'ar')).toBe('فبراير');
  expect(toLocalizedMonthName(2, 'fr')).toBe('février');
});
