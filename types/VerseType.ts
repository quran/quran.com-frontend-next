import WordType from './WordType';
import TranslationType from './TranslationType';

interface VerseType {
  id: number;
  verseNumber: number;
  chapterId: number | string;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubNumber: number;
  verseKey: string;
  words: Array<WordType>;
  textMadani: string;
  textSimple: string;
  sajdah?: boolean;
  translations?: Array<TranslationType>;
  audio?: $TsFixMe;
}

export default VerseType;
