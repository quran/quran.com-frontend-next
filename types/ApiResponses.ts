import AudioData from './AudioData';
import AvailableLanguage from './AvailableLanguage';
import AvailableTranslation from './AvailableTranslation';
import Chapter from './Chapter';
import ChapterInfo from './ChapterInfo';
import Footnote from './Footnote';
import Reciter from './Reciter';
import { SearchNavigationResult } from './SearchNavigationResult';
import TafsirInfo from './TafsirInfo';
import Verse from './Verse';

export interface BaseResponse {
  status?: number;
  error?: string;
}

interface Pagination {
  perPage: number;
  currentPage: number;
  nextPage: number | null;
  totalRecords: number;
  totalPages: number;
}

// The response from the verses endpoint that returns a list of verses
export interface VersesResponse extends BaseResponse {
  pagination: Pagination;
  verses: Verse[];
  metaData?: Record<string, string>;
}

// The response from the chapters endpoint that returns a list of the chapters
export interface ChaptersResponse extends BaseResponse {
  chapters: Chapter[];
}

// The response from the chapter endpoint that returns information on a chapter
export interface ChapterResponse extends BaseResponse {
  chapter: Chapter;
}

export interface TranslationsResponse extends BaseResponse {
  translations?: AvailableTranslation[];
}

export interface LanguagesResponse extends BaseResponse {
  languages?: AvailableLanguage[];
}

export interface RecitersResponse extends BaseResponse {
  reciters?: Reciter[];
}

export interface AudioDataResponse extends BaseResponse {
  audioData: AudioData[];
}

export interface AudioTimestampsResponse extends BaseResponse {
  result: {
    timestampFrom: number;
    timestampTo: number;
  };
}
export interface SearchResponse extends BaseResponse {
  pagination: Pagination;
  result?: {
    navigation: SearchNavigationResult[];
    verses: Verse[];
  };
}

export interface AdvancedCopyRawResultResponse extends BaseResponse {
  result?: string;
}

export interface TafsirsResponse extends BaseResponse {
  tafsirs?: TafsirInfo[];
}

export interface ChapterInfoResponse extends BaseResponse {
  chapterInfo?: ChapterInfo;
}

export interface FootnoteResponse extends BaseResponse {
  footNote?: Footnote;
}
