import Verse from './Verse';

export interface SearchVerseResult extends Verse {
  resultType: string;
  verseId: number;
  highlightedWords?: number[];
}
