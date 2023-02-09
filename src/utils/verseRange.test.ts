import { describe, expect, it } from 'vitest';

import {
  mergeVerseRanges,
  mergeVerseKeys,
  incrementVerseKey,
  decrementVerseKey,
} from './verseRange';

import chapters from '@/data/chapters/en.json';
import type ChaptersData from '@/types/ChaptersData';

// @ts-ignore
const chaptersData = chapters as ChaptersData;

describe('merge verse keys', () => {
  it('should merge back to back verses', () => {
    expect(mergeVerseKeys(new Set(['1:1', '1:2', '1:3', '1:7']))).toEqual(
      new Set(['1:1-1:3', '1:7-1:7']),
    );
  });

  it("should merge verses if they're not back to back but the distance is 1", () => {
    expect(mergeVerseKeys(new Set(['1:1', '1:2', '1:3', '1:5']))).toEqual(new Set(['1:1-1:5']));
  });

  it('should not merge verses', () => {
    expect(mergeVerseKeys(new Set(['1:1', '2:2', '1:4', '1:10']))).toEqual(
      new Set(['1:1-1:1', '2:2-2:2', '1:4-1:4', '1:10-1:10']),
    );
  });

  // it('should merge back to back verses in different chapters', () => {
  //   expect(mergeVerseKeys(new Set(['1:7', '2:1']), chaptersData)).toEqual(new Set(['1:7-2:1']));
  // });
});

describe('merge ranges', () => {
  it('should merge cross-surah ranges', () => {
    mergeVerseRanges(['1:1-1:7', '2:1-2:10'], chaptersData);
    expect(mergeVerseRanges(['1:1-1:7', '2:1-2:10'], chaptersData)).toEqual(['1:1-2:10']);
    expect(mergeVerseRanges(['2:1-2:10', '1:1-1:7'], chaptersData)).toEqual(['1:1-2:10']);
  });

  it('should merge back to back ranges', () => {
    expect(mergeVerseRanges(['1:1-1:2', '1:2-1:4'], chaptersData)).toEqual(['1:1-1:4']);
    expect(mergeVerseRanges(['2:1-2:2', '2:3-2:10'], chaptersData)).toEqual(['2:1-2:10']);
    expect(mergeVerseRanges(['2:1-2:2', '2:2-2:10'], chaptersData)).toEqual(['2:1-2:10']);
    expect(mergeVerseRanges(['2:2-2:10', '2:1-2:2'], chaptersData)).toEqual(['2:1-2:10']);
  });

  it('should dedupe ranges that are already defined', () => {
    expect(mergeVerseRanges(['2:1-2:10', '2:3-2:7'], chaptersData)).toEqual(['2:1-2:10']);
    expect(mergeVerseRanges(['2:3-2:7', '2:1-2:10'], chaptersData)).toEqual(['2:1-2:10']);
  });

  it('should not merge ranges', () => {
    expect(mergeVerseRanges(['1:1-1:2', '1:4-1:5'], chaptersData)).toEqual(['1:1-1:2', '1:4-1:5']);
  });
});

describe('increment verse key', () => {
  it('should increment verse key', () => {
    expect(incrementVerseKey('1:1', chaptersData)).toEqual('1:2');
  });

  it('should increment verse key and change chapter', () => {
    expect(incrementVerseKey('1:7', chaptersData)).toEqual('2:1');
  });

  it('should not increment verse key and change chapter', () => {
    expect(incrementVerseKey('114:6', chaptersData)).toEqual('114:6');
  });
});

describe('decrement verse key', () => {
  it('should decrement verse key', () => {
    expect(decrementVerseKey('1:7', chaptersData)).toEqual('1:6');
  });

  it('should decrement verse key and change chapter', () => {
    expect(decrementVerseKey('2:1', chaptersData)).toEqual('1:7');
  });

  it('should not decrement verse key', () => {
    expect(decrementVerseKey('1:1', chaptersData)).toEqual('1:1');
  });
});
