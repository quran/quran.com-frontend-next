import TranslationType from './TranslationType';
import TransliterationType from './TransliterationType';

export enum CharType {
  Word = 'word',
  End = 'end',
}
interface WordType {
  arabic?: string;
  verseKey: string;
  charType: CharType;
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
