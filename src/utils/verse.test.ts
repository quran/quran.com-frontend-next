/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { it, expect, describe } from 'vitest';

import { getAllChaptersData } from './chapter';
import { generateChapterVersesKeys, getDistanceBetweenVerses, sortWordLocation } from './verse';

describe('sort verse word position', () => {
  it('should sort based on chapter', async () => {
    const input = ['3:0:0', '2:0:0'];
    const expected = ['2:0:0', '3:0:0'];

    expect(sortWordLocation(input)).toEqual(expected);
  });

  it('should sort based on chapter', async () => {
    const input = ['2:3:0', '2:2:0'];
    const expected = ['2:2:0', '2:3:0'];
    const result = sortWordLocation(input);

    expect(result).toEqual(expected);
  });

  it('should sort based on word position', async () => {
    const input = ['2:2:2', '2:2:1'];
    const expected = ['2:2:1', '2:2:2'];
    const result = sortWordLocation(input);

    expect(result).toEqual(expected);
  });

  it('can sort with multi digit position', async () => {
    const input = ['2:2:2', '2:2:10'];
    const expected = ['2:2:2', '2:2:10'];
    const result = sortWordLocation(input);

    expect(result).toEqual(expected);
  });

  it('can sort with multi digit verse', async () => {
    const input = ['2:9:2', '2:10:2'];
    const expected = ['2:9:2', '2:10:2'];
    const result = sortWordLocation(input);

    expect(result).toEqual(expected);
  });
});

describe('get the distance between 2 verses', () => {
  it('should calculate the distance correctly when both verses are the same', async () => {
    const firstVerseKey = '1:1';
    const secondVerseKey = '1:1';
    const expected = 0;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are in the same Surah', async () => {
    const firstVerseKey = '1:1';
    const secondVerseKey = '1:7';
    const expected = 6;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are in the same Surah', async () => {
    const firstVerseKey = '1:7';
    const secondVerseKey = '1:1';
    const expected = 6;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are in the same Surah and both verses are not the beginning/end of the Surah', async () => {
    const firstVerseKey = '1:5';
    const secondVerseKey = '1:2';
    const expected = 3;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are in the same Surah and both verses are not the beginning/end of the Surah', async () => {
    const firstVerseKey = '1:2';
    const secondVerseKey = '1:5';
    const expected = 3;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are one Surah apart', async () => {
    const firstVerseKey = '1:1';
    const secondVerseKey = '2:286';
    const expected = 292;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are one Surah apart', async () => {
    const firstVerseKey = '2:286';
    const secondVerseKey = '1:1';
    const expected = 292;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are one Surah apart and both verses are not the beginning/end of the Surah', async () => {
    const firstVerseKey = '1:2';
    const secondVerseKey = '2:100';
    const expected = 105;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are one Surah apart and both verses are not the beginning/end of the Surah', async () => {
    const firstVerseKey = '2:100';
    const secondVerseKey = '1:2';
    const expected = 105;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are a few Surahs apart', async () => {
    const firstVerseKey = '1:1';
    const secondVerseKey = '5:120';
    const expected = 788;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are a few Surahs apart', async () => {
    const firstVerseKey = '5:120';
    const secondVerseKey = '1:1';
    const expected = 788;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are a few Surahs apart and both verses are not the beginning/end of the Surah', async () => {
    const firstVerseKey = '1:5';
    const secondVerseKey = '5:5';
    const expected = 669;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are a few Surahs apart and both verses are not the beginning/end of the Surah', async () => {
    const firstVerseKey = '5:5';
    const secondVerseKey = '1:5';
    const expected = 669;
    const chaptersData = await getAllChaptersData();
    const result = getDistanceBetweenVerses(chaptersData, firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
});

describe('generateChapterVersesKeys', () => {
  it('should generate keys with chapterId', async () => {
    const chapterId = '001';
    const chaptersData = await getAllChaptersData();
    const expectedKeys = ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7'];
    const result = generateChapterVersesKeys(chaptersData, chapterId, false);
    expect(result).toEqual(expectedKeys);
  });

  it('should generate keys without chapterId when hideChapterId is true', async () => {
    const chapterId = '001';
    const expectedKeys = ['1', '2', '3', '4', '5', '6', '7'];
    const chaptersData = await getAllChaptersData();
    const result = generateChapterVersesKeys(chaptersData, chapterId, true);
    expect(result).toEqual(expectedKeys);
  });

  it('should handle chapterId with different lengths', async () => {
    const chapterId = '112';
    const expectedKeys = ['112:1', '112:2', '112:3', '112:4'];
    const chaptersData = await getAllChaptersData();
    const result = generateChapterVersesKeys(chaptersData, chapterId, false);
    expect(result).toEqual(expectedKeys);
  });

  it('should return an empty array if the chapterId is not found in data', async () => {
    const chapterId = '200';
    const expectedKeys = [];
    const chaptersData = await getAllChaptersData();
    const result = generateChapterVersesKeys(chaptersData, chapterId, false);
    expect(result).toEqual(expectedKeys);
  });
});
