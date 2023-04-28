import { it, expect } from 'vitest';

import { removeItemFromArray } from '../../array';

it('should return the original array if the item is not found', () => {
  const input = [1, 2, 3];
  const itemToRemove = 4;

  expect(removeItemFromArray(itemToRemove, input)).toEqual(input);
});

it('should remove a single item from the array', () => {
  const input = [1, 2, 3];
  const itemToRemove = 2;
  const expectedOutput = [1, 3];

  expect(removeItemFromArray(itemToRemove, input)).toEqual(expectedOutput);
});

it('should remove multiple instances of the item from the array', () => {
  const input = [1, 2, 3, 2, 4, 2];
  const itemToRemove = 2;
  const expectedOutput = [1, 3, 4];

  expect(removeItemFromArray(itemToRemove, input)).toEqual(expectedOutput);
});

it('should not modify the original array', () => {
  const input = [1, 2, 3];
  const itemToRemove = 2;

  removeItemFromArray(itemToRemove, input);

  expect(input).toEqual([1, 2, 3]);
});

it('should return a new array instance', () => {
  const input = [1, 2, 3];
  const itemToRemove = 2;
  const output = removeItemFromArray(itemToRemove, input);

  expect(output).not.toBe(input);
});
