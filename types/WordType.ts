import TranslationType from './TranslationType';
import TransliterationType from './TransliterationType';

export enum CharType {
  Word = 'word',
  End = 'end',
}

interface WordType {
  verseKey: string;
  charTypeName: CharType;
  codeV1?: string;
  codeV2?: string;
  pageNumber?: number;
  lineNumber: number;
  position: number;
  location?: string;
  translation?: TranslationType;
  transliteration?: TransliterationType;
  wordId?: number;
  textUthmani?: string | null;
  textIndopak?: string | null;
  highlight?: string;
  audio: $TsFixMe;
  [key: string]: $TsFixMe;
}

export default WordType;
