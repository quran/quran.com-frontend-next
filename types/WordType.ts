import TranslationType from './TranslationType';
import TransliterationType from './TransliterationType';

interface WordType {
  arabic?: string;
  verseKey: string;
  charType: string;
  className: string;
  code: string;
  lineNumber: number;
  pageNumber: number;
  position: number;
  translation?: TranslationType;
  transliteration?: TransliterationType;
  wordId?: number;
  textMadani?: string | null;
  highlight?: string;
  audio: $TsFixMe;
  [key: string]: $TsFixMe;
}

export default WordType;
