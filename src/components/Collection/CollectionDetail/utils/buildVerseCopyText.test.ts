import { describe, expect, it } from 'vitest';

import buildVerseCopyText from './buildVerseCopyText';

describe('buildVerseCopyText', () => {
  it('builds expected copy text for non-Arabic locales using transliterated surah name', () => {
    const text = buildVerseCopyText({
      lang: 'en',
      qdcUrl: 'https://quran.com/1/2',
      chapter: { transliteratedName: 'Al-Fatihah', nameArabic: 'ٱلْفَاتِحَةُ' } as any,
      verse: {
        verseKey: '1:2',
        textUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
        translations: [
          {
            text: '<p>Praise belongs to Allah, the Lord of all the worlds.</p>',
            resourceName: 'Dr. Mustafa Khattab, The Clear Quran',
          },
        ],
      } as any,
    });

    expect(text).toContain('Al-Fatihah (1:2)');
    expect(text).toContain('ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ');
    expect(text).toContain('Praise belongs to Allah, the Lord of all the worlds.');
    expect(text).toContain('- Dr. Mustafa Khattab, The Clear Quran');
    expect(text.endsWith('https://quran.com/1/2')).toBe(true);
  });

  it('uses Arabic surah name when locale is Arabic', () => {
    const text = buildVerseCopyText({
      lang: 'ar',
      qdcUrl: 'https://quran.com/1/7',
      chapter: { transliteratedName: 'Al-Fatihah', nameArabic: 'ٱلْفَاتِحَةُ' } as any,
      verse: {
        verseKey: '1:7',
        words: [{ textUthmani: 'صِرَٰطَ' }, { textUthmani: 'ٱلَّذِينَ' }],
        translations: [],
      } as any,
    });

    expect(text).toContain('ٱلْفَاتِحَةُ (1:7)');
    expect(text).toContain('صِرَٰطَ ٱلَّذِينَ');
    expect(text.endsWith('https://quran.com/1/7')).toBe(true);
  });
});
