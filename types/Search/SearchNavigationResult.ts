export enum SearchNavigationType {
  SURAH = 'surah',
  JUZ = 'juz',
  HIZB = 'hizb',
  RUB_EL_HIZB = 'rub_el_hizb',
  SEARCH_PAGE = 'search_page',
  PAGE = 'page',
  RANGE = 'range',
  HISTORY = 'history',
  AYAH = 'ayah',
  TRANSLITERATION = 'transliteration',
  TRANSLATION = 'translation',
}

export interface SearchNavigationResult {
  resultType: SearchNavigationType;
  name: string;
  key: number | string;
  isArabic?: boolean;
  isTransliteration?: boolean;
}
