import { toLocalizedNumber } from './locale';

it('toLocalizedNumber works as expected', () => {
  expect(toLocalizedNumber(9, 'en', true)).toBe('09');
  expect(toLocalizedNumber(9, 'ar', true)).toBe('٠٩');
  expect(toLocalizedNumber(10, 'en', true)).toBe('10');
  expect(toLocalizedNumber(10, 'ar', true)).toBe('١٠');
  expect(toLocalizedNumber(9, 'en')).toBe('9');
  expect(toLocalizedNumber(9, 'ar')).toBe('٩');
});
