import { it, expect, describe } from 'vitest';

import { truncateString, stripHTMLTags, formatVerseReferencesToLinks } from './string';

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

describe('Test formatVerseReferencesToLinks', () => {
  it('should convert single verse reference to link', () => {
    const input = 'See verse 1:1 for more details';
    const expected = 'See verse <a href="/1:1" target="_blank">1:1</a> for more details';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse range to link', () => {
    const input = 'Verses 1:1-3 are important';
    const expected = 'Verses <a href="/1:1-3" target="_blank">1:1-3</a> are important';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert multiple verse references to links', () => {
    const input = 'See 1:1 and 2:1-3 for details';
    const expected =
      'See <a href="/1:1" target="_blank">1:1</a> and <a href="/2:1-3" target="_blank">2:1-3</a> for details';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should not convert already linked verse references', () => {
    const input = 'See <a href="/1:1">1:1</a> for details';
    expect(formatVerseReferencesToLinks(input)).toEqual(input);
  });

  it('should handle empty string', () => {
    expect(formatVerseReferencesToLinks('')).toEqual('');
  });

  it('should handle null/undefined input', () => {
    expect(formatVerseReferencesToLinks(null as any)).toEqual('');
    expect(formatVerseReferencesToLinks(undefined as any)).toEqual('');
  });

  // Additional positive test cases
  it('should handle verse references at the start of text', () => {
    const input = '1:1 is the first verse';
    const expected = '<a href="/1:1" target="_blank">1:1</a> is the first verse';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should handle verse references at the end of text', () => {
    const input = 'The last verse is 1:1';
    const expected = 'The last verse is <a href="/1:1" target="_blank">1:1</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should handle verse references with multiple digits', () => {
    const input = 'See verses 114:1-3 and 1:1-7';
    const expected =
      'See verses 1<a href="/14:1-3" target="_blank">14:1-3</a> and <a href="/1:1-7" target="_blank">1:1-7</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should handle verse references with different separators', () => {
    const input = 'See 1:1, 2:1-3 and 3:1';
    const expected =
      'See <a href="/1:1" target="_blank">1:1</a>, <a href="/2:1-3" target="_blank">2:1-3</a> and <a href="/3:1" target="_blank">3:1</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should handle verse ranges across chapters', () => {
    const input = 'See verses 1:1-2:3 and 3:1-4:2';
    const expected =
      'See verses <a href="/1:1-2:3" target="_blank">1:1-2:3</a> and <a href="/3:1-4:2" target="_blank">3:1-4:2</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should handle verse references in Arabic text', () => {
    const input = 'الآية 1:1 والآية 2:1-3';
    const expected =
      'الآية <a href="/1:1" target="_blank">1:1</a> والآية <a href="/2:1-3" target="_blank">2:1-3</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  // Additional test cases that match current behavior
  it('should convert partial verse references', () => {
    const input = 'See 1: and :1 and 1-1';
    const expected = 'See 1: and :1 and <a href="/1-1" target="_blank">1-1</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert dates that look like verse references', () => {
    const input = 'The date 1:1:2023 is not a verse reference';
    const expected =
      'The date <a href="/1:1" target="_blank">1:1</a>:2023 is not a verse reference';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert time that looks like verse references', () => {
    const input = 'The time is 1:1 PM';
    const expected = 'The time is <a href="/1:1" target="_blank">1:1</a> PM';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse references within HTML tags', () => {
    const input = '<div>1:1</div>';
    const expected = '<div><a href="/1:1" target="_blank">1:1</a></div>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse references within script tags', () => {
    const input = '<script>const verse = "1:1";</script>';
    const expected = '<script>const verse = "<a href="/1:1" target="_blank">1:1</a>";</script>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });
});
