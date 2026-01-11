import { it, expect, describe } from 'vitest';

import omit from '@/utils/object';

// eslint-disable-next-line react-func/max-lines-per-function
describe('omit', () => {
  it('should omit specified keys from an object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, ['a', 'c']);

    expect(result).toEqual({ b: 2 });
    expect(result).not.toHaveProperty('a');
    expect(result).not.toHaveProperty('c');
  });

  it('should return original object when no keys are omitted', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, []);

    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should handle empty object', () => {
    const obj = {} as Record<string, unknown>;
    const result = omit(obj, ['a', 'b']);

    expect(result).toEqual({});
  });

  it('should handle non-existent keys', () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, ['c', 'd'] as never[]);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should handle omitting all keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, ['a', 'b', 'c']);

    expect(result).toEqual({});
  });

  it('should not mutate the original object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const originalObj = { ...obj };
    omit(obj, ['a']);

    expect(obj).toEqual(originalObj);
  });

  it('should handle objects with different value types', () => {
    const obj = {
      string: 'test',
      number: 42,
      boolean: true,
      nullValue: null,
      undefinedValue: undefined,
      array: [1, 2, 3],
      nested: { foo: 'bar' },
    };
    const result = omit(obj, ['nullValue', 'undefinedValue']);

    expect(result).toEqual({
      string: 'test',
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      nested: { foo: 'bar' },
    });
  });

  it('should handle objects with numeric string keys', () => {
    const obj = { '1': 'one', '2': 'two', '3': 'three' };
    const result = omit(obj, ['1', '3']);

    expect(result).toEqual({ '2': 'two' });
  });

  it('should handle duplicate keys in omit array', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, ['a', 'a', 'b']);

    expect(result).toEqual({ c: 3 });
  });

  it('should handle single key omission', () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, ['a']);

    expect(result).toEqual({ b: 2 });
  });

  it('should handle objects with zero values', () => {
    const obj = { zero: 0, empty: '', falseValue: false };
    const result = omit(obj, ['empty']);

    expect(result).toEqual({ zero: 0, falseValue: false });
  });

  it('should handle objects with function values', () => {
    const fn = () => 'test';
    const obj = { a: 1, fn, b: 2 };
    const result = omit(obj, ['a']);

    expect(result).toEqual({ fn, b: 2 });
    expect(result.fn).toBe(fn);
  });

  it('should handle readonly keys array', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const keys = ['a', 'b'] as const;
    const result = omit(obj, keys);

    expect(result).toEqual({ c: 3 });
  });
});
