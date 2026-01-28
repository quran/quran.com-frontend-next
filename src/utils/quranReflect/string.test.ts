/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import { getCopyReflectionContent } from './string';

import enChaptersData from '@/data/chapters/en.json';
import ChaptersData from '@/types/ChaptersData';

// Helpers to build test data with minimal typing friction
type VerseLike = {
  verseNumber: number;
  chapterId: number;
  translations: { id: number; text: string }[];
};

const chaptersData = enChaptersData as unknown as ChaptersData;

describe('getCopyReflectionContent', () => {
  it('formats a group with multiple ayahs using plural "Verses" and range', () => {
    const versesByIndex: Record<string, VerseLike[]> = {
      '0': [
        { verseNumber: 1, chapterId: 1, translations: [{ id: 20, text: 'Ayah 1 text' }] },
        { verseNumber: 2, chapterId: 1, translations: [{ id: 20, text: 'Ayah 2 text' }] },
      ],
    };

    // references: function expects to find a filter where chapterId === (citationId - 1)
    // and then pick the citationNames entry that matches translationId
    const references: any[] = [
      {
        chapterId: 1, // citationId (2) - 1
        chapter: {
          citationNames: [
            { translationId: 99, name: 'Wrong Name' },
            { translationId: 20, name: 'Al-Fatihah' },
          ],
        },
      },
    ];

    const result = getCopyReflectionContent(versesByIndex as any, chaptersData, references as any);

    // Expected output format:
    // Chapter {surahNumber}: {surahName}, Verses:  {from} - {to}\r\n
    // {text} ({verseNumber}) ...\r\n\r\n
    expect(result).toBe(
      'Chapter 1: Al-Fatihah, Verses:  1 - 2\r\nAyah 1 text (1) Ayah 2 text (2) \r\n\r\n',
    );
  });

  it('formats a group with a single ayah using singular "Verse"', () => {
    const versesByIndex: Record<string, VerseLike[]> = {
      '0': [{ verseNumber: 5, chapterId: 18, translations: [{ id: 77, text: 'Single ayah' }] }],
    };

    const references: any[] = [
      {
        chapterId: 18, // 19 - 1
        chapter: {
          citationNames: [{ translationId: 77, name: 'Al-Kahf' }],
        },
      },
    ];

    const result = getCopyReflectionContent(versesByIndex as any, chaptersData, references as any);
    expect(result).toBe('Chapter 18: Al-Kahf, Verse:  5\r\nSingle ayah (5) \r\n\r\n');
  });

  it('skips groups without a first inner array', () => {
    const versesByIndex: Record<string, VerseLike[]> = {
      '0': [], // no verses, should be skipped
      '1': [{ verseNumber: 7, chapterId: 2, translations: [{ id: 33, text: 'Valid' }] }],
    };

    const references: any[] = [
      {
        chapterId: 2, // 3 - 1
        chapter: {
          citationNames: [{ translationId: 33, name: 'Al-Baqarah' }],
        },
      },
    ];

    const result = getCopyReflectionContent(versesByIndex as any, chaptersData, references as any);
    expect(result).toBe('Chapter 2: Al-Baqarah, Verse:  7\r\nValid (7) \r\n\r\n');
  });
});
