import { it, expect, describe } from 'vitest';

import { truncateString, stripHTMLTags } from './string';

describe('Test truncateString', () => {
  it('should shorten english text correctly', () => {
    const verseText = 'test';
    const result = truncateString(verseText, 1);

    expect(result).toEqual('t...');
  });
  it('should shorten arabic text correctly', () => {
    const verseText =
      'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ';
    const result = truncateString(verseText, 50);

    expect(result).toEqual('ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيّ...');
  });
  it('should not shorten when text is below the limit', () => {
    const verseText = 'test';
    const result = truncateString(verseText, 10);

    expect(result).toEqual('test');
  });
  it('should shorten text correctly with suffix', () => {
    const verseText = 'test';
    const result = truncateString(verseText, 1, '....');

    expect(result).toEqual('t....');
  });
});

describe('Test stripHTMLTags', () => {
  it('should strip HTML tags correctly', () => {
    expect(
      stripHTMLTags(
        '<h2>Which was revealed in Makkah</h2><h2>The Meaning of Al-Fatihah and its Various Names</h2> <p>This Surah is called</p> <p>- Al-Fatihah, that is, the Opener of the Book, the Surah with which prayers are begun.</p> <p>- It is also called, Umm Al-Kitab (the Mother of the Book), according to the majority of the scholars.</p>',
      ),
    ).toEqual(
      'Which was revealed in MakkahThe Meaning of Al-Fatihah and its Various Names This Surah is called - Al-Fatihah, that is, the Opener of the Book, the Surah with which prayers are begun. - It is also called, Umm Al-Kitab (the Mother of the Book), according to the majority of the scholars.',
    );
  });
});
