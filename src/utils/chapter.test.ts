import { describe, it, expect } from 'vitest';

import {
  getContinueReadingChapterNumber,
  getFirstChapterNumber,
  getNextChapterNumber,
  getPreviousChapterNumber,
} from './chapter';
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

describe('getFirstChapterNumber', () => {
  it('returns Al-Fatiha in standard order', () => {
    expect(getFirstChapterNumber(false)).toBe(1);
    expect(getFirstChapterNumber()).toBe(1);
  });

  it('returns the first revealed chapter in revelation order', () => {
    expect(getFirstChapterNumber(true)).toBe(REVELATION_ORDER[0]);
  });
});

describe('getContinueReadingChapterNumber', () => {
  it('returns the next chapter in standard order', () => {
    expect(getContinueReadingChapterNumber(1, false)).toBe(2);
    expect(getContinueReadingChapterNumber(113, false)).toBe(114);
  });

  it('wraps around to Al-Fatiha after An-Nas in standard order', () => {
    expect(getContinueReadingChapterNumber(114, false)).toBe(1);
  });

  it('returns the next chapter in revelation order', () => {
    expect(getContinueReadingChapterNumber(REVELATION_ORDER[0], true)).toBe(REVELATION_ORDER[1]);
  });

  it('wraps around to the first revealed chapter after the last one in revelation order', () => {
    const last = REVELATION_ORDER[REVELATION_ORDER.length - 1];
    expect(getContinueReadingChapterNumber(last, true)).toBe(REVELATION_ORDER[0]);
  });

  it('does not wrap An-Nas in revelation order, where it is not the last chapter', () => {
    const indexOfAnNas = REVELATION_ORDER.indexOf(114);
    expect(getContinueReadingChapterNumber(114, true)).toBe(REVELATION_ORDER[indexOfAnNas + 1]);
  });
});
