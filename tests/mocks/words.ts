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
  {
    id: 2,
    position: 2,
    audioUrl: 'wbw/001_001_002.mp3',
    charTypeName: CharType.Word,
    lineNumber: 2,
    codeV2: 'ﱂ',
    codeV1: 'ﭒ',
    textIndopak: 'اللهِ',
    textUthmani: 'ٱللَّهِ',
    translation: {
      text: '(of) Allah',
      languageName: 'english',
    },
    transliteration: {
      text: 'l-lahi',
      languageName: 'english',
    },
  },
  {
    id: 3,
    position: 3,
    audioUrl: 'wbw/001_001_003.mp3',
    charTypeName: CharType.Word,
    lineNumber: 2,
    codeV2: 'ﱃ',
    codeV1: 'ﭓ',
    textIndopak: 'الرَّحۡمٰنِ',
    textUthmani: 'ٱلرَّحْمَـٰنِ',
    translation: {
      text: 'the Most Gracious',
      languageName: 'english',
    },
    transliteration: {
      text: 'l-raḥmāni',
      languageName: 'english',
    },
  },
  {
    id: 4,
    position: 4,
    audioUrl: 'wbw/001_001_004.mp3',
    charTypeName: CharType.Word,
    lineNumber: 2,
    codeV2: 'ﱄ',
    codeV1: 'ﭔ',
    textIndopak: 'الرَّحِيۡمِ',
    textUthmani: 'ٱلرَّحِيمِ',
    translation: {
      text: 'the Most Merciful',
      languageName: 'english',
    },
    transliteration: {
      text: 'l-raḥīmi',
      languageName: 'english',
    },
  },
  {
    id: 5,
    position: 5,
    audioUrl: null,
    charTypeName: 'end',
    lineNumber: 2,
    codeV2: 'ﱅ',
    codeV1: 'ﭕ',
    textIndopak: '١',
    textUthmani: '١',
    translation: {
      text: 'Ayah 1',
      languageName: 'english',
    },
    transliteration: {
      text: null,
      languageName: 'english',
    },
  },
];
