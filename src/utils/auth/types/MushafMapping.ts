import { Mushaf } from '@/types/QuranReader';

export interface MappedPage {
  sourcePageNumber: number;
  sourceMushafId: Mushaf;
  targetPageNumber: number;
  targetMushafId: Mushaf;
  firstVerseKey?: string;
}

export interface MappedVerse {
  sourceVerse: { surahNumber: number; verseNumber: number };
  sourceMushafId: Mushaf;
  targetVerses: Array<{ surahNumber: number; verseNumber: number; pageNumber?: number }>;
  targetMushafId: Mushaf;
}

export type MapMushafParams =
  | {
      type: 'page';
      sourceMushaf: Mushaf;
      targetMushaf: Mushaf;
      sourcePage: number;
    }
  | {
      type: 'verse';
      sourceMushaf: Mushaf;
      targetMushaf: Mushaf;
      surah: number;
      verse: number;
    };
