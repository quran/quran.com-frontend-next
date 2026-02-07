/**
 * Grade information for a hadith
 */
export type HadithGrade = {
  grade: string;
  gradeBy: string | null;
};

/**
 * A single hadith text in a specific language
 */
export type HadithText = {
  lang: string;
  chapterNumber: string;
  chapterTitle: string;
  urn: number;
  body: string;
  grades: HadithGrade[];
};

/**
 * Backend response for a single hadith collection (after fetcher camelCase conversion)
 */
export type HadithCollectionResponse = {
  collection: string;
  bookNumber: string;
  chapterId: string;
  hadithNumber: string;
  hadith: HadithText[];
  name: string;
};

/**
 * A single Hadith reference frontend
 */
export type HadithReference = {
  collection: string;
  bookNumber: string;
  chapterId: string;
  hadithNumber: string;
  grades: HadithGrade[];
  name: string;
  // Additional fields for the nested hadith data
  ar?: HadithText;
  en?: HadithText;
};

/**
 * Response type for paginated hadiths for an ayah backend
 */
export type AyahHadithsBackendResponse = {
  hadiths: HadithCollectionResponse[];
  page: number;
  limit: number;
  hasMore: boolean;
  language: string;
  direction: string;
};

/**
 * Response type for paginated hadiths for an ayah frontend
 */
export type AyahHadithsResponse = {
  hadiths: HadithReference[];
  page: number;
  limit: number;
  hasMore: boolean;
  language: string;
  direction: string;
};

/**
 * Response type for hadith count within a range
 * Maps verse keys to their hadith count
 */
export type HadithCountResponse = Record<string, number>;
