/**
 * Grade information for a hadith
 */
export type HadithGrade = {
  grade: string;
  gradeBy: string | null;
};

/**
 * A single Hadith reference
 */
export type HadithReference = {
  collection: string;
  bookNumber: string;
  chapterId: string;
  hadithNumber: string;
  enBody?: string;
  enUrn?: number;
  arBody?: string;
  arUrn?: number;
  grades: HadithGrade[];
  name: string;
};

/**
 * Response type for paginated hadiths for an ayah
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
