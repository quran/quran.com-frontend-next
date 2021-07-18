import Verse from './Verse';
import Chapter from './Chapter';
import AvailableTranslation from './AvailableTranslation';

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
  translations?: AvailableTranslation[];
  status?: number;
  error?: string;
}
