import Word from './Word';
import Translation from './Translation';

interface Verse {
  id: number;
  verseNumber: number;
  chapterId: number | string;
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  rubNumber: number;
  verseKey: string;
  words: Word[];
  textUthmani?: string;
  sajdah?: boolean;
  translations?: Translation[];
  audio?: $TsFixMe;
}

export default Verse;
