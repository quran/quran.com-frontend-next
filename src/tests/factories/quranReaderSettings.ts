import merge from 'lodash/merge';

import type QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { MushafLines, QuranFont } from '@/types/QuranReader';

const defaults: QuranReaderStyles = {
  tafsirFontScale: 1,
  reflectionFontScale: 1,
  lessonFontScale: 1,
  translationFontScale: 1,
  quranTextFontScale: 1,
  wordByWordFontScale: 1,
  qnaFontScale: 1,
  surahInfoFontScale: 1,
  hadithFontScale: 1,
  layersFontScale: 1,
  quranFont: QuranFont.QPCHafs,
  mushafLines: MushafLines.FifteenLines,
  isUsingDefaultFont: true,
  showTajweedRules: true,
};

export const makeQuranReaderSettings = (
  overrides: Partial<QuranReaderStyles> = {},
): QuranReaderStyles => merge({ ...defaults }, overrides) as QuranReaderStyles;
