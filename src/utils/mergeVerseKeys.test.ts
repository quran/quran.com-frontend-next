import { describe, expect, it } from 'vitest';

import mergeVerseKeys from './mergeVerseKeys';

describe('merge verse keys', () => {
  it('should merge back to back verses', () => {
    expect(mergeVerseKeys(new Set(['1:1', '1:2', '1:3', '1:7']))).toEqual(new Set(['1:1-1:7']));
  });

  it("should merge verses if they're not back to back but the distance is 1", () => {
    expect(mergeVerseKeys(new Set(['1:1', '1:2', '1:3', '1:5']))).toEqual(new Set(['1:1-1:5']));
  });

  it('should not merge verses', () => {
    expect(mergeVerseKeys(new Set(['1:1', '2:2', '2:10']))).toEqual(
      new Set(['1:1-1:1', '2:2-2:2', '2:10-2:10']),
    );
  });

  // it('should merge back to back verses in different chapters', () => {
  //   expect(mergeVerseKeys(new Set(['1:7', '2:1']), chaptersData)).toEqual(new Set(['1:7-2:1']));
  // });
});
