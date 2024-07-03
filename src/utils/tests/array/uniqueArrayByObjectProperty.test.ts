import { it, expect } from 'vitest';

import { uniqueArrayByObjectProperty } from '../../array';

it('should return an empty array if the input array is empty', () => {
  const input = [];
  const output = uniqueArrayByObjectProperty(input, 'id');
  expect(output).toEqual([]);
});

it('should return the same array if there are no duplicates', () => {
  const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const output = uniqueArrayByObjectProperty(input, 'id');
  expect(output).toEqual(input);
});

it('should return an array with duplicates removed based on the property', () => {
  const input = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }];
  const output = uniqueArrayByObjectProperty(input, 'id');
  expect(output).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
});

it('should handle different property names correctly', () => {
  const input = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Alice' }];
  const output = uniqueArrayByObjectProperty(input, 'name');
  expect(output).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
});

it('should handle objects that do not have the specified property correctly', () => {
  const input = [{ id: 1 }, { name: 'Bob' }, { id: 1 }, { id: 2 }];
  const output = uniqueArrayByObjectProperty(input, 'id');
  expect(output).toEqual([{ id: 1 }, { name: 'Bob' }, { id: 2 }]);
});

it('should handle arrays with different types of data correctly', () => {
  const input = [{ id: 1 }, 2, { id: 1 }, 'test', { id: 2 }, 'test'];
  const output = uniqueArrayByObjectProperty(input, 'id');
  expect(output).toEqual([{ id: 1 }, 2, 'test', { id: 2 }]);
});
