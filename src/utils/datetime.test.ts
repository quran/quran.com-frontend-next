import { getEarliestDate } from './datetime';

it('getEarliestDate returns earliest date', () => {
  const result = getEarliestDate([
    '2021-12-02T23:22:00.000Z',
    '2021-12-02T23:21:00.000Z',
    '2021-12-02T23:20:00.000Z',
  ]);
  expect(result).toBe(1638487200000);
});
