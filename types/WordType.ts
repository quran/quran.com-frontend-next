import TranslationType from './TranslationType';
import TransliterationType from './TransliterationType';

export enum CharType {
  Word = 'word',
  End = 'end',
  Pause = 'pause',
  Sajdah = 'sajdah',
}

interface WordType {
  verseKey?: string;
  charTypeName: CharType;
  codeV1?: string;
  codeV2?: string;
  pageNumber?: number;
  lineNumber?: number;
  position: number;
  location?: string;
  translation?: TranslationType;
  transliteration?: TransliterationType;
  id?: number;
  textUthmani?: string;
  textIndopak?: string;
  highlight?: string;
  audioUrl: $TsFixMe;
  [key: string]: $TsFixMe;
}

export default WordType;
