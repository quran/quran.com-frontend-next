import { toLocalizedNumber } from './locale';

it('toLocalizedNumber works as expected', () => {
  expect(toLocalizedNumber(9, 'en', true)).toBe('09');
  expect(toLocalizedNumber(10, 'en', true)).toBe('10');
  expect(toLocalizedNumber(9, 'en')).toBe('9');
});
