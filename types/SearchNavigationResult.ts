export enum SearchNavigationType {
  SURAH = 'surah',
  JUZ = 'juz',
  AYAH = 'ayah',
  PAGE = 'page',
}

export interface SearchNavigationResult {
  resultType: SearchNavigationType;
  name: string;
  key: number | string;
}
