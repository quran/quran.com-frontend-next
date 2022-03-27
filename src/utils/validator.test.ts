/* eslint-disable react-func/max-lines-per-function */
import { getAllChaptersData } from './chapter';
import { isValidVerseKey } from './validator';

describe('isValidVerseKey', () => {
  it('invalid format should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, 'invalidVerseKey')).toEqual(false);
  });
  it('more than 2 parts should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, '1:2:3')).toEqual(false);
  });
  it('2 parts by both are not numbers should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, 'one:two')).toEqual(false);
  });
  it('2 parts by chapterId is not number should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, 'one:2')).toEqual(false);
  });
  it('2 parts by verseNumber is not number should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, '1:two')).toEqual(false);
  });
  it('chapterId exceeds 114 should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, '115:1')).toEqual(false);
  });
  it('chapterId less than 1 should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, '0:1')).toEqual(false);
  });
  it('verseNumber less than 1 should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, '1:0')).toEqual(false);
  });
  it('verseNumber exceed chapter total number of verses should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, '1:8')).toEqual(false);
  });
  it('correct verse number should pass', async () => {
    const chaptersData = await getAllChaptersData();
    expect(isValidVerseKey(chaptersData, '1:7')).toEqual(true);
  });
});
