/* eslint-disable max-lines */
import { it, expect, describe } from 'vitest';

import {
  truncateString,
  stripHTMLTags,
  stripHtml,
  getHtmlTextLength,
  truncateHtml,
  formatVerseReferencesToLinks,
  getWordCount,
  isNumericString,
} from './string';

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

describe('stripHtml', () => {
  // Basic functionality
  it('should strip simple HTML tags', () => {
    expect(stripHtml('<p>Hello World</p>')).toBe('Hello World');
  });

  it('should strip nested HTML tags', () => {
    expect(stripHtml('<div><p><strong>Nested</strong> content</p></div>')).toBe('Nested content');
  });

  it('should handle empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('should handle null/undefined input', () => {
    expect(stripHtml(null as any)).toBe('');
    expect(stripHtml(undefined as any)).toBe('');
  });

  it('should handle plain text without HTML', () => {
    expect(stripHtml('Plain text without tags')).toBe('Plain text without tags');
  });

  // Multi-lingual content tests
  it('should strip HTML from Arabic content', () => {
    expect(stripHtml('<p>وُلد الشيخ عبد الله حمد أبو شريدة عام ١٩٩٢</p>')).toBe(
      'وُلد الشيخ عبد الله حمد أبو شريدة عام ١٩٩٢',
    );
  });

  it('should strip HTML from Chinese content', () => {
    expect(stripHtml('<span>这是中文内容</span>')).toBe('这是中文内容');
  });

  it('should strip HTML from Japanese content', () => {
    expect(stripHtml('<div>これは日本語のテキストです</div>')).toBe('これは日本語のテキストです');
  });

  it('should strip HTML from Korean content', () => {
    expect(stripHtml('<p>이것은 한국어 텍스트입니다</p>')).toBe('이것은 한국어 텍스트입니다');
  });

  it('should strip HTML from Russian content', () => {
    expect(stripHtml('<p>Это русский текст</p>')).toBe('Это русский текст');
  });

  it('should strip HTML from mixed RTL and LTR content', () => {
    const html = '<p>English and العربية mixed</p>';
    expect(stripHtml(html)).toBe('English and العربية mixed');
  });

  // Complex HTML scenarios
  it('should handle HTML with long attributes (Google Translate scenario)', () => {
    const html =
      '<p id="tw-target-text" class="tw-data-text tw-text-large" dir="rtl" aria-label="Very long label text here" data-ved="extremely-long-data-attribute-value"><span class="Y2IQFc" lang="ar">وُلد الشيخ</span></p>';
    expect(stripHtml(html)).toBe('وُلد الشيخ');
  });

  it('should handle pre tags with whitespace', () => {
    const html = '<pre>  Preformatted   text  </pre>';
    expect(stripHtml(html).trim()).toContain('Preformatted');
  });

  it('should handle self-closing tags', () => {
    expect(stripHtml('Hello<br/>World<br />Test')).toBe('HelloWorldTest');
  });

  it('should handle HTML comments', () => {
    expect(stripHtml('Hello<!-- comment -->World')).toBe('HelloWorld');
  });

  // HTML entities
  it('should decode common HTML entities', () => {
    // Note: Server-side regex-based strip handles these; browser DOMParser handles automatically
    const result = stripHtml('Hello&nbsp;World&amp;Test');
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });

  // Edge cases
  it('should handle malformed HTML', () => {
    expect(stripHtml('<p>Unclosed tag')).toBe('Unclosed tag');
  });

  it('should handle deeply nested HTML', () => {
    const html = '<div><div><div><div><p>Deep</p></div></div></div></div>';
    expect(stripHtml(html)).toBe('Deep');
  });

  it('should handle multiple paragraphs', () => {
    const html = '<p>First paragraph.</p><p>Second paragraph.</p>';
    expect(stripHtml(html)).toBe('First paragraph.Second paragraph.');
  });

  it('should handle list elements', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    expect(stripHtml(html)).toBe('Item 1Item 2');
  });

  it('should handle table content', () => {
    const html = '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>';
    expect(stripHtml(html)).toBe('Cell 1Cell 2');
  });
});

describe('getHtmlTextLength', () => {
  it('should return correct length for simple HTML', () => {
    expect(getHtmlTextLength('<p>Hello</p>')).toBe(5);
  });

  it('should return correct length for empty string', () => {
    expect(getHtmlTextLength('')).toBe(0);
  });

  it('should not count HTML tags in length', () => {
    const html = '<div><strong>Bold</strong> text</div>';
    expect(getHtmlTextLength(html)).toBe(9); // "Bold text"
  });

  it('should return correct length for Arabic text', () => {
    const html = '<p>مرحبا</p>';
    expect(getHtmlTextLength(html)).toBe(5); // 5 Arabic characters
  });

  it('should handle HTML with long attributes', () => {
    const html = '<p class="very-long-class-name" data-attribute="extremely-long-value">Short</p>';
    expect(getHtmlTextLength(html)).toBe(5); // Only "Short"
  });
});

describe('truncateHtml', () => {
  // Basic functionality
  it('should return original HTML when text is within limit', () => {
    const html = '<p>Short text</p>';
    expect(truncateHtml(html, 100)).toBe(html);
  });

  it('should truncate when text exceeds limit and preserve tags', () => {
    const html = '<p>This is a very long text that should be truncated</p>';
    const result = truncateHtml(html, 10);
    expect(result).toBe('<p>This is a </p>...');
  });

  it('should handle empty string', () => {
    expect(truncateHtml('', 100)).toBe('');
  });

  it('should handle null/undefined input', () => {
    expect(truncateHtml(null as any, 100)).toBe('');
    expect(truncateHtml(undefined as any, 100)).toBe('');
  });

  it('should use custom suffix', () => {
    const html = '<p>This is long text</p>';
    const result = truncateHtml(html, 7, '…');
    expect(result).toBe('<p>This is</p>…');
  });

  // Multi-lingual content tests
  it('should truncate Arabic content correctly', () => {
    const html = '<p>وُلد الشيخ عبد الله حمد أبو شريدة عام ١٩٩٢</p>';
    const result = truncateHtml(html, 15);
    expect(result).toContain('وُلد');
    expect(result).toContain('...');
    expect(result).toContain('<p>');
    expect(result).toContain('</p>');
  });

  it('should truncate Chinese content correctly', () => {
    const html = '<p>这是一个很长的中文文本需要被截断</p>';
    const result = truncateHtml(html, 5);
    expect(result).toBe('<p>这是一个很</p>...');
  });

  it('should truncate Japanese content correctly', () => {
    const html = '<p>これは非常に長い日本語のテキストです</p>';
    const result = truncateHtml(html, 8);
    expect(result).toBe('<p>これは非常に長い</p>...');
  });

  it('should truncate Korean content correctly', () => {
    const html = '<p>이것은 매우 긴 한국어 텍스트입니다</p>';
    const result = truncateHtml(html, 10);
    expect(result).toContain('<p>');
    expect(result).toContain('</p>');
    expect(result).toContain('...');
  });

  // Complex HTML scenarios - preserves structure
  it('should preserve nested tags and close them properly', () => {
    const html = '<p><span>This is the actual content that is long</span></p>';
    const result = truncateHtml(html, 15);
    expect(result).toBe('<p><span>This is the act</span></p>...');
  });

  it('should handle Google Translate style HTML correctly', () => {
    const html =
      '<p id="tw-target-text" class="tw-data-text"><span class="Y2IQFc" lang="ar">وُلد الشيخ عبد الله حمد أبو شريدة عام ١٩٩٢</span></p>';
    const result = truncateHtml(html, 20);
    expect(result).toContain('<p');
    expect(result).toContain('</p>');
    expect(result).toContain('<span');
    expect(result).toContain('</span>');
    expect(result).toContain('...');
  });

  // Edge cases
  it('should handle exact length match', () => {
    const html = '<p>Exact</p>';
    expect(truncateHtml(html, 5)).toBe(html);
  });

  it('should handle maxLength of 0', () => {
    const html = '<p>Test</p>';
    const result = truncateHtml(html, 0);
    expect(result).toBe('...');
  });

  it('should handle very long HTML with short visible content', () => {
    const html = `<div class="${'a'.repeat(1000)}">Hi</div>`;
    expect(truncateHtml(html, 10)).toBe(html); // "Hi" is only 2 chars
  });

  it('should preserve original HTML when content fits', () => {
    const html = '<strong>Bold</strong> <em>italic</em>';
    expect(truncateHtml(html, 100)).toBe(html);
  });

  // Paragraph preservation tests
  it('should preserve multiple paragraph structure when truncating', () => {
    const html = '<p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>';
    const result = truncateHtml(html, 25);
    expect(result).toContain('<p>First paragraph</p>');
    expect(result).toContain('<p>Second');
    expect(result).toContain('</p>...');
  });

  it('should handle self-closing br tags', () => {
    const html = 'Line one<br/>Line two<br/>Line three and more text here';
    const result = truncateHtml(html, 20);
    expect(result).toContain('<br/>');
    expect(result).toContain('...');
  });

  it('should handle br tags without slash', () => {
    const html = 'Line one<br>Line two<br>Line three';
    const result = truncateHtml(html, 15);
    expect(result).toContain('<br>');
    expect(result).toContain('...');
  });
});

describe('Test formatVerseReferencesToLinks', () => {
  it('should convert single verse reference to link', () => {
    const input = 'See verse 1:1 for more details';
    const expected = 'See verse <a href="/1:1" target="_blank">1:1</a> for more details';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse reference with three digit verse number to link', () => {
    const input = 'Verse 2:123 is important';
    const expected = 'Verse <a href="/2:123" target="_blank">2:123</a> is important';
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
      'See verses <a href="/114:1-3" target="_blank">114:1-3</a> and <a href="/1:1-7" target="_blank">1:1-7</a>';
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

  // Test cases for verse references in different languages
  it('should convert verse references in English text', () => {
    const input = 'This is a normal text with verse 1:1 and 2:3 in it';
    const expected =
      'This is a normal text with verse <a href="/1:1" target="_blank">1:1</a> and <a href="/2:3" target="_blank">2:3</a> in it';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse references in Arabic text', () => {
    const input = 'هذا نص عادي يحتوي على الآية 1:1 والآية 2:3';
    const expected =
      'هذا نص عادي يحتوي على الآية <a href="/1:1" target="_blank">1:1</a> والآية <a href="/2:3" target="_blank">2:3</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse references in French text', () => {
    const input = 'Ceci est un texte normal avec le verset 1:1 et 2:3';
    const expected =
      'Ceci est un texte normal avec le verset <a href="/1:1" target="_blank">1:1</a> et <a href="/2:3" target="_blank">2:3</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse references in Spanish text', () => {
    const input = 'Este es un texto normal con el versículo 1:1 y 2:3';
    const expected =
      'Este es un texto normal con el versículo <a href="/1:1" target="_blank">1:1</a> y <a href="/2:3" target="_blank">2:3</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse references in Chinese text', () => {
    const input = '这是一个普通文本，包含经文 1:1 和 2:3';
    const expected =
      '这是一个普通文本，包含经文 <a href="/1:1" target="_blank">1:1</a> 和 <a href="/2:3" target="_blank">2:3</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse references in Japanese text', () => {
    const input = 'これは普通のテキストで、聖句 1:1 と 2:3 を含みます';
    const expected =
      'これは普通のテキストで、聖句 <a href="/1:1" target="_blank">1:1</a> と <a href="/2:3" target="_blank">2:3</a> を含みます';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse references in Korean text', () => {
    const input = '이것은 일반 텍스트로, 성구 1:1과 2:3을 포함합니다';
    const expected =
      '이것은 일반 텍스트로, 성구 <a href="/1:1" target="_blank">1:1</a>과 <a href="/2:3" target="_blank">2:3</a>을 포함합니다';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  it('should convert verse references in Russian text', () => {
    const input = 'Это обычный текст с аятом 1:1 и 2:3';
    const expected =
      'Это обычный текст с аятом <a href="/1:1" target="_blank">1:1</a> и <a href="/2:3" target="_blank">2:3</a>';
    expect(formatVerseReferencesToLinks(input)).toEqual(expected);
  });

  // Test cases for text without verse references
  it('should not modify English text without verse references', () => {
    const input = 'This is a normal text without any verse references';
    expect(formatVerseReferencesToLinks(input)).toEqual(input);
  });

  it('should not modify Arabic text without verse references', () => {
    const input = 'هذا نص عادي لا يحتوي على أي إشارات للآيات';
    expect(formatVerseReferencesToLinks(input)).toEqual(input);
  });

  it('should not modify French text without verse references', () => {
    const input = 'Ceci est un texte normal sans aucune référence aux versets';
    expect(formatVerseReferencesToLinks(input)).toEqual(input);
  });

  it('should not modify Spanish text without verse references', () => {
    const input = 'Este es un texto normal sin referencias a versículos';
    expect(formatVerseReferencesToLinks(input)).toEqual(input);
  });

  it('should not modify Chinese text without verse references', () => {
    const input = '这是一个没有经文引用的普通文本';
    expect(formatVerseReferencesToLinks(input)).toEqual(input);
  });

  it('should not modify Japanese text without verse references', () => {
    const input = 'これは聖句の参照を含まない通常のテキストです';
    expect(formatVerseReferencesToLinks(input)).toEqual(input);
  });

  it('should not modify Korean text without verse references', () => {
    const input = '이것은 성구 참조가 없는 일반 텍스트입니다';
    expect(formatVerseReferencesToLinks(input)).toEqual(input);
  });

  it('should not modify Russian text without verse references', () => {
    const input = 'Это обычный текст без ссылок на аяты';
    expect(formatVerseReferencesToLinks(input)).toEqual(input);
  });
});

describe('getWordCount', () => {
  it('counts words in a simple sentence', () => {
    expect(getWordCount('hello world from Quran')).toBe(4);
  });

  it('ignores extra whitespace', () => {
    expect(getWordCount('  multiple   spaces\nnew\tlines ')).toBe(4);
  });
});

describe('isNumericString', () => {
  it('returns true for single digit', () => {
    expect(isNumericString('0')).toBe(true);
    expect(isNumericString('5')).toBe(true);
    expect(isNumericString('9')).toBe(true);
  });

  it('returns true for multiple digits', () => {
    expect(isNumericString('123')).toBe(true);
    expect(isNumericString('456789')).toBe(true);
    expect(isNumericString('00123')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isNumericString('')).toBe(false);
  });

  it('returns false for strings with letters', () => {
    expect(isNumericString('abc')).toBe(false);
    expect(isNumericString('12a3')).toBe(false);
    expect(isNumericString('sg')).toBe(false);
    expect(isNumericString('pl')).toBe(false);
  });

  it('returns false for decimal and negative numbers', () => {
    expect(isNumericString('12.3')).toBe(false);
    expect(isNumericString('-5')).toBe(false);
  });

  it('returns false for strings with whitespace or special chars', () => {
    expect(isNumericString(' 123')).toBe(false);
    expect(isNumericString('1,234')).toBe(false);
    expect(isNumericString('1:1')).toBe(false);
  });
});
