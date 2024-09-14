/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { it, expect, describe } from 'vitest';

import { getAllChaptersData } from './chapter';
import {
  isValidVerseKey,
  isValidVerseRange,
  isRangesStringValid,
  isValidChapterId,
  isValidVerseFrom,
  isValidVerseTo,
} from './validator';

describe('isValidVerseKey', async () => {
  const chaptersData = await getAllChaptersData();
  it('invalid format should fail', async () => {
    expect(isValidVerseKey(chaptersData, 'invalidVerseKey')).toEqual(false);
  });
  it('more than 2 parts should fail', async () => {
    expect(isValidVerseKey(chaptersData, '1:2:3')).toEqual(false);
  });
  it('2 parts by both are not numbers should fail', async () => {
    expect(isValidVerseKey(chaptersData, 'one:two')).toEqual(false);
  });
  it('2 parts but chapterId is not number should fail', async () => {
    expect(isValidVerseKey(chaptersData, 'one:2')).toEqual(false);
  });
  it('2 parts but verseNumber is not number should fail', async () => {
    expect(isValidVerseKey(chaptersData, '1:two')).toEqual(false);
  });
  it('chapterId exceeds 114 should fail', async () => {
    expect(isValidVerseKey(chaptersData, '115:1')).toEqual(false);
  });
  it('chapterId less than 1 should fail', async () => {
    expect(isValidVerseKey(chaptersData, '0:1')).toEqual(false);
  });
  it('verseNumber less than 1 should fail', async () => {
    expect(isValidVerseKey(chaptersData, '1:0')).toEqual(false);
  });
  it('verseNumber exceed chapter total number of verses should fail', async () => {
    expect(isValidVerseKey(chaptersData, '1:8')).toEqual(false);
  });
  it('correct verse number should pass', async () => {
    expect(isValidVerseKey(chaptersData, '1:7')).toEqual(true);
  });
});

describe('isValidVerseRange', async () => {
  const chaptersData = await getAllChaptersData();
  it('invalid chapterId should fail', async () => {
    expect(isValidVerseRange(chaptersData, 'invalidChapterId', '1-2')).toEqual(false);
  });
  it('out of range chapterId should fail', async () => {
    expect(isValidVerseRange(chaptersData, '115', '1-2')).toEqual(false);
  });
  it('invalid format should fail', async () => {
    expect(isValidVerseRange(chaptersData, '1', 'test')).toEqual(false);
  });
  it('more than 2 parts should fail', async () => {
    expect(isValidVerseRange(chaptersData, '1', '1-2-3')).toEqual(false);
  });
  it('2 parts by both are not numbers should fail', async () => {
    expect(isValidVerseRange(chaptersData, '1', 'one-two')).toEqual(false);
  });
  it('2 parts but first verse is not number should fail', async () => {
    expect(isValidVerseRange(chaptersData, '1', 'one-2')).toEqual(false);
  });
  it('2 parts but 2nd verse is not number should fail', async () => {
    expect(isValidVerseRange(chaptersData, '1', '1-two')).toEqual(false);
  });
  it('first verse bigger than 2nd verse should fail', async () => {
    expect(isValidVerseRange(chaptersData, '1', '2-1')).toEqual(false);
  });
  it('1st verse less than 1 should fail', async () => {
    expect(isValidVerseRange(chaptersData, '1', '0-1')).toEqual(false);
  });
  it('2nd verse is 0 should fail', async () => {
    expect(isValidVerseRange(chaptersData, '1', '1-0')).toEqual(false);
  });
  it('2nd verse exceeds chapter total number of verses should fail', async () => {
    expect(isValidVerseRange(chaptersData, '1', '1-8')).toEqual(false);
  });
  it('correct verse number should pass', async () => {
    expect(isValidVerseRange(chaptersData, '1', '1-7')).toEqual(true);
  });
});

describe('isRangesStringValid', async () => {
  const chaptersData = await getAllChaptersData();
  describe('Same-Surah', async () => {
    it('invalid format should fail', async () => {
      expect(isRangesStringValid(chaptersData, '1-2 test')).toEqual(false);
    });
    it('Same-Surah valid range should pass', async () => {
      expect(isRangesStringValid(chaptersData, '1:1-1:7')).toEqual(true);
    });
    it('Same-Surah out of range should fail', async () => {
      expect(isRangesStringValid(chaptersData, '1:1-1:8')).toEqual(false);
    });
    it('Same-Surah start bigger than end should fail', async () => {
      expect(isRangesStringValid(chaptersData, '1:2-1:1')).toEqual(false);
    });
  });
  describe('Cross-Surah', async () => {
    it('Cross-Surah valid range should pass', async () => {
      expect(isRangesStringValid(chaptersData, '1:1-2:7')).toEqual(true);
    });
    it('Cross-Surahs valid range should pass', async () => {
      expect(isRangesStringValid(chaptersData, '84:1-114:6')).toEqual(true);
    });
    it('Cross-Surah out of range should fail', async () => {
      expect(isRangesStringValid(chaptersData, '1:8-2:5')).toEqual(false);
    });
    it('Cross-Surah invalid range should fail', async () => {
      expect(isRangesStringValid(chaptersData, '1:8-2:500')).toEqual(false);
    });
    it('Cross-Surah start bigger than end should fail', async () => {
      expect(isRangesStringValid(chaptersData, '2:1-1:1')).toEqual(false);
    });
  });
});

describe('isValidChapterId', () => {
  it('should return true for valid chapterId', () => {
    expect(isValidChapterId('1')).toEqual(true);
  });

  it('should return false for non-numeric chapterId', () => {
    expect(isValidChapterId('test')).toEqual(false);
  });

  it('should return false for chapterId greater than 114', () => {
    expect(isValidChapterId('115')).toEqual(false);
  });

  it('should return false for chapterId less than 1', () => {
    expect(isValidChapterId('0')).toEqual(false);
  });
});

describe('isValidVerseFrom', () => {
  it('should return true if the start verse is valid', () => {
    const startVerseKey = '1:1';
    const endVerseKey = '1:5';
    const versesCount = 7;
    const chapterID = '1';
    expect(isValidVerseFrom(startVerseKey, endVerseKey, versesCount, chapterID)).toEqual(true);
  });

  it('should return false if the start verse is bigger than the total number of verses', () => {
    const startVerseKey = '1:8';
    const endVerseKey = '1:10';
    const versesCount = 7;
    const chapterID = '1';
    expect(isValidVerseFrom(startVerseKey, endVerseKey, versesCount, chapterID)).toEqual(false);
  });

  it('should return false if the start verse is not in the same chapter as the end verse', () => {
    const startVerseKey = '1:1';
    const endVerseKey = '2:5';
    const versesCount = 7;
    const chapterID = '1';
    expect(isValidVerseFrom(startVerseKey, endVerseKey, versesCount, chapterID)).toEqual(false);
  });

  it('should return false if the difference between start and end verses is greater than 10', () => {
    const startVerseKey = '1:1';
    const endVerseKey = '1:12';
    const versesCount = 20;
    const chapterID = '1';
    expect(isValidVerseFrom(startVerseKey, endVerseKey, versesCount, chapterID)).toEqual(false);
  });
});

describe('isValidVerseTo', () => {
  it('should return true if the end verse is valid', () => {
    const startVerseKey = '1:1';
    const endVerseKey = '1:5';
    const versesCount = 7;
    const chapterID = '1';
    expect(isValidVerseTo(startVerseKey, endVerseKey, versesCount, chapterID)).toEqual(true);
  });

  it('should return false if the end verse is smaller than the start verse', () => {
    const startVerseKey = '1:1';
    const endVerseKey = '1:0';
    const versesCount = 7;
    const chapterID = '1';
    expect(isValidVerseTo(startVerseKey, endVerseKey, versesCount, chapterID)).toEqual(false);
  });

  it('should return false if the end verse is bigger than the total number of verses', () => {
    const startVerseKey = '1:1';
    const endVerseKey = '1:8';
    const versesCount = 7;
    const chapterID = '1';
    expect(isValidVerseTo(startVerseKey, endVerseKey, versesCount, chapterID)).toEqual(false);
  });

  it('should return false if the end verse is not in the same chapter as the start verse', () => {
    const startVerseKey = '1:1';
    const endVerseKey = '2:5';
    const versesCount = 7;
    const chapterID = '1';
    expect(isValidVerseTo(startVerseKey, endVerseKey, versesCount, chapterID)).toEqual(false);
  });

  it('should return false if the difference between start and end verses is greater than 10', () => {
    const startVerseKey = '1:1';
    const endVerseKey = '1:12';
    const versesCount = 20;
    const chapterID = '1';
    expect(isValidVerseTo(startVerseKey, endVerseKey, versesCount, chapterID)).toEqual(false);
  });
});
