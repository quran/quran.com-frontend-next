import { it, expect } from 'vitest';

import { areArraysEqual } from '../../array';

it('should return true for empty arrays', () => {
  expect(areArraysEqual([], [])).toBe(true);
});

it('should return true for equal arrays', () => {
  const array1 = [1, 2, 3];
  const array2 = [2, 3, 1];

  expect(areArraysEqual(array1, array2)).toBe(true);
});

it('should return false for arrays with different elements', () => {
  const array1 = [1, 2, 3];
  const array2 = [2, 3, 4];

  expect(areArraysEqual(array1, array2)).toBe(false);
});

it('should return false for arrays with different lengths', () => {
  const array1 = [1, 2, 3];
  const array2 = [2, 3];

  expect(areArraysEqual(array1, array2)).toBe(false);
});

it('should not modify the original arrays', () => {
  const array1 = [1, 2, 3];
  const array2 = [2, 3, 1];

  areArraysEqual(array1, array2);

  expect(array1).toEqual([1, 2, 3]);
  expect(array2).toEqual([2, 3, 1]);
});
