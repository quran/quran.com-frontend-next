import Verse from './Verse';
import Chapter from './Chapter';
import TranslationResource from './TranslationResource';

// The response from the verses endpoint that returns a list of verses
export interface VersesResponse {
  pagination: {
    perPage: number;
    currentPage: number;
    nextPage: number | null;
    totalRecords: number;
    totalPages: number;
  };
  verses: Verse[];
}

// The response from the chapters endpoint that returns a list of the chapters
export interface ChaptersResponse {
  chapters: Chapter[];
}

// The response from the chapter endpoint that returns information on a chapter
export interface ChapterResponse {
  chapter: Chapter;
}

export interface TranslationsResponse {
  translations?: TranslationResource[];
  status?: number;
  error?: string;
}
