/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { ParsedUrlQuery } from 'querystring';

import { describe, expect, it } from 'vitest';

import { getAllChaptersData } from '../chapter';

import {
  isValidHexColor,
  isValidVerseToOrFrom,
  prepareGenerateMediaFileRequestData,
} from './utils';

import Alignment from '@/types/Media/Alignment';
import GenerateMediaFileRequest, { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import Orientation from '@/types/Media/Orientation';
import WatermarkColor from '@/types/Media/WatermarkColor';
import QueryParam from '@/types/QueryParam';
import { QuranFont } from '@/types/QuranReader';

describe('isValidVerseToOrFrom', async () => {
  const chaptersData = await getAllChaptersData();

  const query: ParsedUrlQuery = {
    surah: '2',
    verseFrom: '5',
    verseTo: '10',
  };

  it('should return true when the verse from is valid', () => {
    const result = isValidVerseToOrFrom(QueryParam.VERSE_FROM, chaptersData, query);

    expect(result).toBe(true);
  });

  it('should return true when the verse to is valid', () => {
    const result = isValidVerseToOrFrom(QueryParam.VERSE_TO, chaptersData, query);

    expect(result).toBe(true);
  });

  it('should return false when the verse from is invalid', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_FROM]: 'invalid' };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_FROM, chaptersData, invalidQuery);

    expect(result).toBe(false);
  });

  it('should return false when the verse to is invalid', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_TO]: 'invalid' };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_TO, chaptersData, invalidQuery);

    expect(result).toBe(false);
  });

  it('should return false when the verse from is greater than the verse to', () => {
    const invalidQuery = {
      ...query,
      [QueryParam.VERSE_FROM]: '10',
      [QueryParam.VERSE_TO]: '5',
    };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_TO, chaptersData, invalidQuery);

    expect(result).toBe(false);
  });

  it('should return false when the verse from is greater than the total number of verses in the chapter', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_FROM]: '287' };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_FROM, chaptersData, invalidQuery);

    expect(result).toBe(false);
  });

  it('should return false when the verse to is greater than the total number of verses in the chapter', () => {
    const invalidQuery = { ...query, [QueryParam.VERSE_TO]: '287' };

    const result = isValidVerseToOrFrom(QueryParam.VERSE_TO, chaptersData, invalidQuery);

    expect(result).toBe(false);
  });
});

describe('isValidHexColor', () => {
  it('should return true for valid 3-digit hex colors', () => {
    expect(isValidHexColor('#fff')).toBe(true);
    expect(isValidHexColor('#ABC')).toBe(true);
    expect(isValidHexColor('#123')).toBe(true);
  });

  it('should return true for valid 6-digit hex colors', () => {
    expect(isValidHexColor('#ffffff')).toBe(true);
    expect(isValidHexColor('#123abc')).toBe(true);
    expect(isValidHexColor('#ABCDEF')).toBe(true);
  });

  it('should return false for invalid hex colors', () => {
    expect(isValidHexColor('fff')).toBe(false); // Missing #
    expect(isValidHexColor('#123abz')).toBe(false); // Invalid character
    expect(isValidHexColor('#12345')).toBe(false); // Incorrect length
    expect(isValidHexColor('#12')).toBe(false); // Incorrect length
    expect(isValidHexColor('#xyzxyz')).toBe(false); // Invalid characters
  });

  it('should return false for empty string or other invalid inputs', () => {
    expect(isValidHexColor('')).toBe(false); // Empty string
    expect(isValidHexColor(null)).toBe(false); // null input
    expect(isValidHexColor(undefined)).toBe(false); // undefined input
    expect(isValidHexColor('#')).toBe(false); // Only #
  });
});

describe('isValidHexColor', () => {
  it('should return true for valid 3-digit hex colors', () => {
    expect(isValidHexColor('#fff')).toBe(true);
    expect(isValidHexColor('#ABC')).toBe(true);
    expect(isValidHexColor('#123')).toBe(true);
  });

  it('should return true for valid 6-digit hex colors', () => {
    expect(isValidHexColor('#ffffff')).toBe(true);
    expect(isValidHexColor('#123abc')).toBe(true);
    expect(isValidHexColor('#ABCDEF')).toBe(true);
  });

  it('should return false for invalid hex colors', () => {
    expect(isValidHexColor('fff')).toBe(false); // Missing #
    expect(isValidHexColor('#123abz')).toBe(false); // Invalid character
    expect(isValidHexColor('#12345')).toBe(false); // Incorrect length
    expect(isValidHexColor('#12')).toBe(false); // Incorrect length
    expect(isValidHexColor('#xyzxyz')).toBe(false); // Invalid characters
  });

  it('should return false for empty string or other invalid inputs', () => {
    expect(isValidHexColor('')).toBe(false); // Empty string
    expect(isValidHexColor(null)).toBe(false); // null input
    expect(isValidHexColor(undefined)).toBe(false); // undefined input
    expect(isValidHexColor('#')).toBe(false); // Only #
  });
});

describe('prepareGenerateMediaFileRequestData', () => {
  it('should format request when type is video', () => {
    const rawData = {
      verses: [
        {
          id: 1,
          verseNumber: 1,
          verseKey: '1:1',
          hizbNumber: 1,
          rubElHizbNumber: 1,
          rukuNumber: 1,
          manzilNumber: 1,
          sajdahNumber: null,
          textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
          chapterId: 1,
          textImlaeiSimple: 'بسم الله الرحمن الرحيم',
          pageNumber: 1,
          juzNumber: 1,
          words: [
            {
              id: 1,
              position: 1,
              audioUrl: 'wbw/001_001_001.mp3',
              qpcUthmaniHafs: 'بِسۡمِ',
              textIndopak: 'بِسۡمِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 9,
              text: 'بِسۡمِ',
              translation: {
                text: 'In (the) name',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: "bis'mi",
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 2,
              position: 2,
              audioUrl: 'wbw/001_001_002.mp3',
              qpcUthmaniHafs: 'ٱللَّهِ',
              textIndopak: 'اللهِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 9,
              text: 'ٱللَّهِ',
              translation: {
                text: '(of) Allah',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'l-lahi',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 3,
              position: 3,
              audioUrl: 'wbw/001_001_003.mp3',
              qpcUthmaniHafs: 'ٱلرَّحۡمَٰنِ',
              textIndopak: 'الرَّحۡمٰنِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 9,
              text: 'ٱلرَّحۡمَٰنِ',
              translation: {
                text: 'the Most Gracious',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'l-raḥmāni',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 4,
              position: 4,
              audioUrl: 'wbw/001_001_004.mp3',
              qpcUthmaniHafs: 'ٱلرَّحِيمِ',
              textIndopak: 'الرَّحِيۡمِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 9,
              text: 'ٱلرَّحِيمِ',
              translation: {
                text: 'the Most Merciful',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'l-raḥīmi',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 5,
              position: 5,
              audioUrl: null,
              qpcUthmaniHafs: '١',
              textIndopak: '١',
              charTypeName: 'end',
              pageNumber: 1,
              lineNumber: 9,
              text: '١',
              translation: {
                text: '(1)',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: null,
                languageName: 'english',
                languageId: 38,
              },
            },
          ],
          timestamps: {
            timestampFrom: 0,
          },
          translations: [
            {
              id: 903958,
              resourceId: 131,
              text: 'In the Name of Allah—the Most Compassionate, Most Merciful.',
              resourceName: 'Dr. Mustafa Khattab, The Clear Quran',
              languageId: 38,
            },
          ],
        },
        {
          id: 2,
          verseNumber: 2,
          verseKey: '1:2',
          hizbNumber: 1,
          rubElHizbNumber: 1,
          rukuNumber: 1,
          manzilNumber: 1,
          sajdahNumber: null,
          textUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
          chapterId: 1,
          textImlaeiSimple: 'الحمد لله رب العالمين',
          pageNumber: 1,
          juzNumber: 1,
          words: [
            {
              id: 1130,
              position: 1,
              audioUrl: 'wbw/001_002_001.mp3',
              qpcUthmaniHafs: 'ٱلۡحَمۡدُ',
              textIndopak: 'اَلۡحَمۡدُ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 10,
              text: 'ٱلۡحَمۡدُ',
              translation: {
                text: 'All praises and thanks',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'al-ḥamdu',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 1131,
              position: 2,
              audioUrl: 'wbw/001_002_002.mp3',
              qpcUthmaniHafs: 'لِلَّهِ',
              textIndopak: 'لِلّٰهِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 10,
              text: 'لِلَّهِ',
              translation: {
                text: '(be) to Allah',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'lillahi',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 1132,
              position: 3,
              audioUrl: 'wbw/001_002_003.mp3',
              qpcUthmaniHafs: 'رَبِّ',
              textIndopak: 'رَبِّ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 10,
              text: 'رَبِّ',
              translation: {
                text: 'the Lord',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'rabbi',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 1133,
              position: 4,
              audioUrl: 'wbw/001_002_004.mp3',
              qpcUthmaniHafs: 'ٱلۡعَٰلَمِينَ',
              textIndopak: 'الۡعٰلَمِيۡنَۙ‏',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 10,
              text: 'ٱلۡعَٰلَمِينَ',
              translation: {
                text: 'of the universe',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'l-ʿālamīna',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 1134,
              position: 5,
              audioUrl: null,
              qpcUthmaniHafs: '٢',
              textIndopak: '٢',
              charTypeName: 'end',
              pageNumber: 1,
              lineNumber: 10,
              text: '٢',
              translation: {
                text: '(2)',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: null,
                languageName: 'english',
                languageId: 38,
              },
            },
          ],
          timestamps: {
            timestampFrom: 6090,
          },
          translations: [
            {
              id: 903959,
              resourceId: 131,
              text: 'All praise is for Allah—Lord of all worlds,<sup foot_note=76373>1</sup>',
              resourceName: 'Dr. Mustafa Khattab, The Clear Quran',
              languageId: 38,
            },
          ],
        },
      ],
      audio: {
        id: 911,
        chapterId: 1,
        fileSize: 839808,
        format: 'mp3',
        audioUrl: 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/1.mp3',
        duration: 11190,
        verseTimings: [
          {
            verseKey: '1:1',
            timestampFrom: 0,
            timestampTo: 6090,
            duration: 6090,
            segments: [
              [1, 0, 580],
              [2, 580, 1409],
              [3, 1409, 2502],
              [4, 2502, 5840],
            ],
            normalizedStart: 0,
            normalizedEnd: 6090,
          },
          {
            verseKey: '1:2',
            timestampFrom: 6090,
            timestampTo: 11680,
            duration: 5590,
            segments: [
              [1, 6025, 7025],
              [2, 7025, 7885],
              [3, 7885, 8515],
              [4, 8515, 11550],
            ],
            normalizedStart: 6090,
            normalizedEnd: 11680,
          },
        ],
        reciterId: 7,
      },
      timestamps: [
        {
          start: 0,
          durationInFrames: 183,
        },
        {
          start: 183,
          durationInFrames: 168,
        },
      ],
      backgroundColor: '#000000',
      opacity: 0.4,
      borderColor: '#000000',
      borderSize: 0,
      fontColor: '#ffffff',
      verseAlignment: Alignment.CENTRE,
      translationAlignment: Alignment.CENTRE,
      video: {
        thumbnailSrc: 'https://images.quran.com/videos/thumbnails/stars.png',
        videoSrc: '/videos/videos_stars.mp4',
        watermarkColor: WatermarkColor.LIGHT,
      },
      quranTextFontScale: 4,
      quranTextFontStyle: QuranFont.QPCHafs,
      translationFontScale: 3,
      orientation: Orientation.PORTRAIT,
      videoId: 4,
      chapterEnglishName: 'The Opener',
      isPlayer: true,
      translations: [131],
      frame: 0,
      type: MediaType.VIDEO,
      chaptersDataArabic: '',
    } as GenerateMediaFileRequest;

    const result = prepareGenerateMediaFileRequestData(rawData);

    expect(result).toStrictEqual({
      audio: {
        reciterId: rawData.audio.reciterId,
      },
      backgroundColor: rawData.backgroundColor,
      borderColor: rawData.borderColor,
      borderSize: rawData.borderSize,
      chaptersDataArabic: rawData.chaptersDataArabic,
      fontColor: rawData.fontColor,
      frame: rawData.frame,
      opacity: rawData.opacity,
      orientation: rawData.orientation,
      quranTextFontScale: rawData.quranTextFontScale,
      quranTextFontStyle: rawData.quranTextFontStyle,
      translations: rawData.translations,
      translationAlignment: rawData.translationAlignment,
      translationFontScale: rawData.translationFontScale,
      type: rawData.type,
      verseAlignment: rawData.verseAlignment,
      videoId: rawData.videoId,
      chapterId: rawData.verses[0].chapterId,
      startVerseKey: rawData.verses[0].verseKey,
      endVerseKey: rawData.verses[rawData.verses.length - 1].verseKey,
    });
  });
  it('should format request when type is image', () => {
    const rawData = {
      verses: [
        {
          id: 1,
          verseNumber: 1,
          verseKey: '1:1',
          hizbNumber: 1,
          rubElHizbNumber: 1,
          rukuNumber: 1,
          manzilNumber: 1,
          sajdahNumber: null,
          textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
          chapterId: 1,
          textImlaeiSimple: 'بسم الله الرحمن الرحيم',
          pageNumber: 1,
          juzNumber: 1,
          words: [
            {
              id: 1,
              position: 1,
              audioUrl: 'wbw/001_001_001.mp3',
              qpcUthmaniHafs: 'بِسۡمِ',
              textIndopak: 'بِسۡمِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 9,
              text: 'بِسۡمِ',
              translation: {
                text: 'In (the) name',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: "bis'mi",
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 2,
              position: 2,
              audioUrl: 'wbw/001_001_002.mp3',
              qpcUthmaniHafs: 'ٱللَّهِ',
              textIndopak: 'اللهِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 9,
              text: 'ٱللَّهِ',
              translation: {
                text: '(of) Allah',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'l-lahi',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 3,
              position: 3,
              audioUrl: 'wbw/001_001_003.mp3',
              qpcUthmaniHafs: 'ٱلرَّحۡمَٰنِ',
              textIndopak: 'الرَّحۡمٰنِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 9,
              text: 'ٱلرَّحۡمَٰنِ',
              translation: {
                text: 'the Most Gracious',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'l-raḥmāni',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 4,
              position: 4,
              audioUrl: 'wbw/001_001_004.mp3',
              qpcUthmaniHafs: 'ٱلرَّحِيمِ',
              textIndopak: 'الرَّحِيۡمِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 9,
              text: 'ٱلرَّحِيمِ',
              translation: {
                text: 'the Most Merciful',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'l-raḥīmi',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 5,
              position: 5,
              audioUrl: null,
              qpcUthmaniHafs: '١',
              textIndopak: '١',
              charTypeName: 'end',
              pageNumber: 1,
              lineNumber: 9,
              text: '١',
              translation: {
                text: '(1)',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: null,
                languageName: 'english',
                languageId: 38,
              },
            },
          ],
          timestamps: {
            timestampFrom: 0,
          },
          translations: [
            {
              id: 903958,
              resourceId: 131,
              text: 'In the Name of Allah—the Most Compassionate, Most Merciful.',
              resourceName: 'Dr. Mustafa Khattab, The Clear Quran',
              languageId: 38,
            },
          ],
        },
        {
          id: 2,
          verseNumber: 2,
          verseKey: '1:2',
          hizbNumber: 1,
          rubElHizbNumber: 1,
          rukuNumber: 1,
          manzilNumber: 1,
          sajdahNumber: null,
          textUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
          chapterId: 1,
          textImlaeiSimple: 'الحمد لله رب العالمين',
          pageNumber: 1,
          juzNumber: 1,
          words: [
            {
              id: 1130,
              position: 1,
              audioUrl: 'wbw/001_002_001.mp3',
              qpcUthmaniHafs: 'ٱلۡحَمۡدُ',
              textIndopak: 'اَلۡحَمۡدُ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 10,
              text: 'ٱلۡحَمۡدُ',
              translation: {
                text: 'All praises and thanks',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'al-ḥamdu',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 1131,
              position: 2,
              audioUrl: 'wbw/001_002_002.mp3',
              qpcUthmaniHafs: 'لِلَّهِ',
              textIndopak: 'لِلّٰهِ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 10,
              text: 'لِلَّهِ',
              translation: {
                text: '(be) to Allah',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'lillahi',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 1132,
              position: 3,
              audioUrl: 'wbw/001_002_003.mp3',
              qpcUthmaniHafs: 'رَبِّ',
              textIndopak: 'رَبِّ',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 10,
              text: 'رَبِّ',
              translation: {
                text: 'the Lord',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'rabbi',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 1133,
              position: 4,
              audioUrl: 'wbw/001_002_004.mp3',
              qpcUthmaniHafs: 'ٱلۡعَٰلَمِينَ',
              textIndopak: 'الۡعٰلَمِيۡنَۙ‏',
              charTypeName: 'word',
              pageNumber: 1,
              lineNumber: 10,
              text: 'ٱلۡعَٰلَمِينَ',
              translation: {
                text: 'of the universe',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: 'l-ʿālamīna',
                languageName: 'english',
                languageId: 38,
              },
            },
            {
              id: 1134,
              position: 5,
              audioUrl: null,
              qpcUthmaniHafs: '٢',
              textIndopak: '٢',
              charTypeName: 'end',
              pageNumber: 1,
              lineNumber: 10,
              text: '٢',
              translation: {
                text: '(2)',
                languageName: 'english',
                languageId: 38,
              },
              transliteration: {
                text: null,
                languageName: 'english',
                languageId: 38,
              },
            },
          ],
          timestamps: {
            timestampFrom: 6090,
          },
          translations: [
            {
              id: 903959,
              resourceId: 131,
              text: 'All praise is for Allah—Lord of all worlds,<sup foot_note=76373>1</sup>',
              resourceName: 'Dr. Mustafa Khattab, The Clear Quran',
              languageId: 38,
            },
          ],
        },
      ],
      audio: {
        id: 911,
        chapterId: 1,
        fileSize: 839808,
        format: 'mp3',
        audioUrl: 'https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/1.mp3',
        duration: 11190,
        verseTimings: [
          {
            verseKey: '1:1',
            timestampFrom: 0,
            timestampTo: 6090,
            duration: 6090,
            segments: [
              [1, 0, 580],
              [2, 580, 1409],
              [3, 1409, 2502],
              [4, 2502, 5840],
            ],
            normalizedStart: 0,
            normalizedEnd: 6090,
          },
          {
            verseKey: '1:2',
            timestampFrom: 6090,
            timestampTo: 11680,
            duration: 5590,
            segments: [
              [1, 6025, 7025],
              [2, 7025, 7885],
              [3, 7885, 8515],
              [4, 8515, 11550],
            ],
            normalizedStart: 6090,
            normalizedEnd: 11680,
          },
        ],
        reciterId: 7,
      },
      timestamps: [
        {
          start: 0,
          durationInFrames: 183,
        },
        {
          start: 183,
          durationInFrames: 168,
        },
      ],
      backgroundColor: '#000000',
      opacity: 0.4,
      borderColor: '#000000',
      borderSize: 0,
      fontColor: '#ffffff',
      verseAlignment: Alignment.CENTRE,
      translationAlignment: Alignment.CENTRE,
      video: {
        thumbnailSrc: 'https://images.quran.com/videos/thumbnails/stars.png',
        videoSrc: '/videos/videos_stars.mp4',
        watermarkColor: WatermarkColor.LIGHT,
      },
      quranTextFontScale: 4,
      quranTextFontStyle: QuranFont.QPCHafs,
      translationFontScale: 3,
      orientation: Orientation.PORTRAIT,
      videoId: 4,
      chapterEnglishName: 'The Opener',
      isPlayer: true,
      translations: [131],
      frame: 0,
      type: MediaType.IMAGE,
      chaptersDataArabic: '',
    } as GenerateMediaFileRequest;

    const result = prepareGenerateMediaFileRequestData(rawData);

    expect(result).toStrictEqual({
      backgroundColor: rawData.backgroundColor,
      borderColor: rawData.borderColor,
      borderSize: rawData.borderSize,
      chaptersDataArabic: rawData.chaptersDataArabic,
      fontColor: rawData.fontColor,
      frame: rawData.frame,
      opacity: rawData.opacity,
      orientation: rawData.orientation,
      quranTextFontScale: rawData.quranTextFontScale,
      quranTextFontStyle: rawData.quranTextFontStyle,
      translations: rawData.translations,
      translationAlignment: rawData.translationAlignment,
      translationFontScale: rawData.translationFontScale,
      type: rawData.type,
      verseAlignment: rawData.verseAlignment,
      videoId: rawData.videoId,
      chapterId: rawData.verses[0].chapterId,
      startVerseKey: rawData.verses[0].verseKey,
      endVerseKey: rawData.verses[rawData.verses.length - 1].verseKey,
      audio: {
        reciterId: rawData.audio.reciterId,
      },
    });
  });
});
