import merge from 'lodash/merge';

import { CharType } from 'types/Word';

export const mockWord = (overrides = {}) =>
  merge(
    {
      id: 1,
      position: 1,
      audioUrl: 'wbw/001_001_001.mp3',
      charTypeName: CharType.Word,
      lineNumber: 2,
      codeV2: 'ﱁ',
      codeV1: 'ﭑ',
      textIndopak: 'بِسۡمِ',
      textUthmani: 'بِسْمِ',
      translation: {
        text: 'In (the) name',
        languageName: 'english',
      },
      transliteration: {
        text: "bis'mi",
        languageName: 'english',
      },
    },
    overrides,
  );

export default [
  {
    id: 1,
    position: 1,
    audioUrl: 'wbw/001_001_001.mp3',
    chaTypeName: 'word',
    pageNumber: 1,
    lineNumber: 2,
    text: 'بِسْمِ',
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
    charTypeName: 'word',
    pageNumber: 1,
    lineNumber: 2,
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
    charTypeName: 'word',
    pageNumber: 1,
    lineNumber: 2,
    text: 'ٱلرَّحْمَـٰنِ',
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
    charTypeName: 'word',
    pageNumber: 1,
    lineNumber: 2,
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
    charTypeName: 'end',
    pageNumber: 1,
    lineNumber: 2,
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
];
