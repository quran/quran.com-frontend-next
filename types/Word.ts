import Translation from './Translation';
import Transliteration from './Transliteration';
import type Verse from './Verse';

export enum CharType {
  Word = 'word',
  End = 'end',
  Pause = 'pause',
  Sajdah = 'sajdah',
  RubElHizb = 'rub-el-hizb',
}

interface Word {
  verseKey?: string;
  charTypeName: CharType;
  codeV1?: string;
  codeV2?: string;
  pageNumber?: number;
  hizbNumber?: number;
  lineNumber?: number;
  position: number;
  location?: string;
  translation?: Translation;
  transliteration?: Transliteration;
  id?: number;
  textUthmani?: string;
  textIndopak?: string;
  qpcUthmaniHafs?: string;
  highlight?: string | boolean;
  text?: string;
  audioUrl: $TsFixMe;
  verse?: Verse;
  [key: string]: $TsFixMe;
}

export default Word;
