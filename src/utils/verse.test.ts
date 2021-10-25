/* eslint-disable react-func/max-lines-per-function */
import { getDistanceBetweenVerses, sortWordLocation, shortenVerseText } from './verse';

describe('sort verse word position', () => {
  it('should sort based on chapter', () => {
    const input = ['3:0:0', '2:0:0'];
    const expected = ['2:0:0', '3:0:0'];

    expect(sortWordLocation(input)).toEqual(expected);
  });

  it('should sort based on chapter', () => {
    const input = ['2:3:0', '2:2:0'];
    const expected = ['2:2:0', '2:3:0'];
    const result = sortWordLocation(input);

    expect(result).toEqual(expected);
  });

  it('should sort based on word position', () => {
    const input = ['2:2:2', '2:2:1'];
    const expected = ['2:2:1', '2:2:2'];
    const result = sortWordLocation(input);

    expect(result).toEqual(expected);
  });

  it('can sort with multi digit position', () => {
    const input = ['2:2:2', '2:2:10'];
    const expected = ['2:2:2', '2:2:10'];
    const result = sortWordLocation(input);

    expect(result).toEqual(expected);
  });

  it('can sort with multi digit verse', () => {
    const input = ['2:9:2', '2:10:2'];
    const expected = ['2:9:2', '2:10:2'];
    const result = sortWordLocation(input);

    expect(result).toEqual(expected);
  });
});

describe('get the distance between 2 verses', () => {
  it('should calculate the distance correctly when both verses are the same', () => {
    const firstVerseKey = '1:1';
    const secondVerseKey = '1:1';
    const expected = 0;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are in the same Surah', () => {
    const firstVerseKey = '1:1';
    const secondVerseKey = '1:7';
    const expected = 6;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are in the same Surah', () => {
    const firstVerseKey = '1:7';
    const secondVerseKey = '1:1';
    const expected = 6;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are in the same Surah and both verses are not the beginning/end of the Surah', () => {
    const firstVerseKey = '1:5';
    const secondVerseKey = '1:2';
    const expected = 3;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are in the same Surah and both verses are not the beginning/end of the Surah', () => {
    const firstVerseKey = '1:2';
    const secondVerseKey = '1:5';
    const expected = 3;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are one Surah apart', () => {
    const firstVerseKey = '1:1';
    const secondVerseKey = '2:286';
    const expected = 292;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are one Surah apart', () => {
    const firstVerseKey = '2:286';
    const secondVerseKey = '1:1';
    const expected = 292;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are one Surah apart and both verses are not the beginning/end of the Surah', () => {
    const firstVerseKey = '1:2';
    const secondVerseKey = '2:100';
    const expected = 105;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are one Surah apart and both verses are not the beginning/end of the Surah', () => {
    const firstVerseKey = '2:100';
    const secondVerseKey = '1:2';
    const expected = 105;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are a few Surahs apart', () => {
    const firstVerseKey = '1:1';
    const secondVerseKey = '5:120';
    const expected = 788;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are a few Surahs apart', () => {
    const firstVerseKey = '5:120';
    const secondVerseKey = '1:1';
    const expected = 788;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('should calculate the distance correctly when both verses are a few Surahs apart and both verses are not the beginning/end of the Surah', () => {
    const firstVerseKey = '1:5';
    const secondVerseKey = '5:5';
    const expected = 669;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
  it('[reversed-order] should calculate the distance correctly when both verses are a few Surahs apart and both verses are not the beginning/end of the Surah', () => {
    const firstVerseKey = '5:5';
    const secondVerseKey = '1:5';
    const expected = 669;
    const result = getDistanceBetweenVerses(firstVerseKey, secondVerseKey);

    expect(result).toEqual(expected);
  });
});

describe('Test shortenVerseText', () => {
  it('should shorten english text correctly', () => {
    const verseText = 'test';
    const result = shortenVerseText(verseText, 1);

    expect(result).toEqual('t...');
  });
  it('should shorten arabic text correctly', () => {
    const verseText =
      'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ';
    const result = shortenVerseText(verseText, 50);

    expect(result).toEqual('ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيّ...');
  });
  it('should not shorten when text is below the limit', () => {
    const verseText = 'test';
    const result = shortenVerseText(verseText, 10);

    expect(result).toEqual('test');
  });
});
