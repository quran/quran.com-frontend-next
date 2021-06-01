import VerseType from './VerseType';
import ChapterType from './ChapterType';

// The response from the verses endpoint that returns a list of verses
export interface VersesResponse {
  meta: {
    currentPage: number;
    nextPage: number;
    prevPage: number;
    totalCount: number;
    totalPages: number;
  };
  verses: VerseType[];
}

// The response from the chapters endpoitn that returns a list of the chapters
export interface ChaptersResponse {
  chapters: ChapterType[];
}

// The response from the chapter endpoint that returns information on a chapter
export interface ChapterResponse {
  chapter: ChapterType;
}
