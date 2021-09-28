import { isValidVerseKey } from './validator';

describe('isValidVerseKey', () => {
  it('invalid format should fail', () => {
    expect(isValidVerseKey('invalidVerseKey')).toEqual(false);
  });
  it('more than 2 parts should fail', () => {
    expect(isValidVerseKey('1:2:3')).toEqual(false);
  });
  it('2 parts by both are not numbers should fail', () => {
    expect(isValidVerseKey('one:two')).toEqual(false);
  });
  it('2 parts by chapterId is not number should fail', () => {
    expect(isValidVerseKey('one:2')).toEqual(false);
  });
  it('2 parts by verseNumber is not number should fail', () => {
    expect(isValidVerseKey('1:two')).toEqual(false);
  });
  it('chapterId exceeds 114 should fail', () => {
    expect(isValidVerseKey('115:1')).toEqual(false);
  });
  it('chapterId less than 1 should fail', () => {
    expect(isValidVerseKey('0:1')).toEqual(false);
  });
  it('verseNumber less than 1 should fail', () => {
    expect(isValidVerseKey('1:0')).toEqual(false);
  });
  it('verseNumber exceed chapter total number of verses should fail', () => {
    expect(isValidVerseKey('1:8')).toEqual(false);
  });
  it('correct verse number should pass', () => {
    expect(isValidVerseKey('1:7')).toEqual(true);
  });
});
