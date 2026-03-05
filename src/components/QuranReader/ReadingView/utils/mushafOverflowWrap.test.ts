import { describe, expect, it } from 'vitest';

import shouldEnableMushafOverflowWrap from './mushafOverflowWrap';

const testCases = [
  {
    name: 'returns true when line width overflows available width in reading mode on tablet+',
    input: {
      isReadingMode: true,
      viewportWidth: 1024,
      availableWidth: 900,
      resolvedLineWidth: 980,
    },
    expected: true,
  },
  {
    name: 'returns false when line width fits in available width',
    input: {
      isReadingMode: true,
      viewportWidth: 1024,
      availableWidth: 900,
      resolvedLineWidth: 900,
    },
    expected: false,
  },
  {
    name: 'returns false when reading mode is disabled',
    input: {
      isReadingMode: false,
      viewportWidth: 1024,
      availableWidth: 900,
      resolvedLineWidth: 980,
    },
    expected: false,
  },
  {
    name: 'returns false below tablet breakpoint',
    input: {
      isReadingMode: true,
      viewportWidth: 767,
      availableWidth: 900,
      resolvedLineWidth: 980,
    },
    expected: false,
  },
];

describe('shouldEnableMushafOverflowWrap', () => {
  it.each(testCases)('$name', ({ input, expected }) => {
    expect(shouldEnableMushafOverflowWrap(input)).toBe(expected);
  });
});
