import { describe, it, expect } from 'vitest';

import { getNextChapterNumber, getPreviousChapterNumber } from './chapter';
import REVELATION_ORDER from './revelationOrder';

describe('chapter navigation (standard order)', () => {
  it('gets next chapter in standard order', () => {
    expect(getNextChapterNumber(1, false)).toBe(2);
    expect(getNextChapterNumber(114, false)).toBeNull();
  });

  it('gets previous chapter in standard order', () => {
    expect(getPreviousChapterNumber(2, false)).toBe(1);
    expect(getPreviousChapterNumber(1, false)).toBeNull();
  });
});

describe('chapter navigation (revelation order)', () => {
  const first = REVELATION_ORDER[0];
  const second = REVELATION_ORDER[1];
  const last = REVELATION_ORDER[REVELATION_ORDER.length - 1];

  it('gets next chapter in revelation order', () => {
    expect(getNextChapterNumber(first, true)).toBe(second);
    expect(getNextChapterNumber(last, true)).toBeNull();
  });

  it('gets previous chapter in revelation order', () => {
    expect(getPreviousChapterNumber(second, true)).toBe(first);
    expect(getPreviousChapterNumber(first, true)).toBeNull();
  });
});
