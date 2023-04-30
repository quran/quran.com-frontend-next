import { it, expect } from 'vitest';

import { mergeTwoArraysUniquely } from '../../array';

it('should merge two arrays and remove duplicates', () => {
  const array1 = [1, 2, 3];
  const array2 = [3, 4, 5];
  const expectedOutput = [1, 2, 3, 4, 5];

  expect(mergeTwoArraysUniquely(array1, array2)).toEqual(expectedOutput);
});

it('should return the second array if the first array is empty', () => {
  const array1 = [];
  const array2 = [1, 2, 3];

  expect(mergeTwoArraysUniquely(array1, array2)).toEqual(array2);
});

it('should return the first array if the second array is empty', () => {
  const array1 = [1, 2, 3];
  const array2 = [];

  expect(mergeTwoArraysUniquely(array1, array2)).toEqual(array1);
});

it('should return an empty array if both arrays are empty', () => {
  const array1 = [];
  const array2 = [];

  expect(mergeTwoArraysUniquely(array1, array2)).toEqual([]);
});

it('should not modify the original arrays', () => {
  const array1 = [1, 2, 3];
  const array2 = [3, 4, 5];

  mergeTwoArraysUniquely(array1, array2);

  expect(array1).toEqual([1, 2, 3]);
  expect(array2).toEqual([3, 4, 5]);
});

it('should return a new array instance', () => {
  const array1 = [1, 2, 3];
  const array2 = [3, 4, 5];
  const output = mergeTwoArraysUniquely(array1, array2);

  expect(output).not.toBe(array1);
  expect(output).not.toBe(array2);
});
