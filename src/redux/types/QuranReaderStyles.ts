import { MushafLines, QuranFont } from 'types/QuranReader';

type QuranReaderStyles = {
  tafsirFontScale: number;
  translationFontScale: number;
  quranTextFontScale: number;
  quranFont: QuranFont;
  mushafLines: MushafLines;
  isUsingDefaultFont: boolean;
};

export default QuranReaderStyles;
