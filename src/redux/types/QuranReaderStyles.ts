import { MushafLines, QuranFont } from '@/types/QuranReader';

type QuranReaderStyles = {
  tafsirFontScale: number;
  reflectionFontScale: number;
  lessonFontScale: number;
  translationFontScale: number;
  quranTextFontScale: number;
  wordByWordFontScale: number;
  qnaFontScale: number;
  surahInfoFontScale: number;
  quranFont: QuranFont;
  mushafLines: MushafLines;
  isUsingDefaultFont: boolean;
};

export default QuranReaderStyles;
