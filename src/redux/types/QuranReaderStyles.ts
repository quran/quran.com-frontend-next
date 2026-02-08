import { MushafLines, QuranFont } from '@/types/QuranReader';

type QuranReaderStyles = {
  tafsirFontScale: number;
  reflectionFontScale: number;
  lessonFontScale: number;
  translationFontScale: number;
  quranTextFontScale: number;
  wordByWordFontScale: number;
  qnaFontScale: number;
  quranFont: QuranFont;
  mushafLines: MushafLines;
  isUsingDefaultFont: boolean;
  showTajweedRules: boolean;
};

export default QuranReaderStyles;
