import Verse from './Verse';
import Chapter from './Chapter';
import AvailableTranslation from './AvailableTranslation';
import SearchResult from './SearchResult';
import AvailableLanguage from './AvailableLanguage';
import Reciter from './Reciter';
import { AudioFile } from './AudioFile';

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

export interface LanguagesResponse {
  languages?: AvailableLanguage[];
  status?: number;
  error?: string;
}

export interface RecitersResponse {
  reciters?: Reciter[];
  status?: number;
  error?: string;
}

export interface ReciterAudioResponse {
  audioFiles: AudioFile[];
  status?: number;
  error?: string;
}

export interface SearchResponse {
  search?: {
    query: string;
    totalResults: number;
    currentPage: number;
    totalPages: number;
    results: SearchResult[];
  };
  status?: number;
  error?: string;
}

export interface AdvancedCopyRawResultResponse {
  result?: string;
  status?: number;
  error?: string;
}
