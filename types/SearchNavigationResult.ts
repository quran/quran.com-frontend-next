export enum SearchNavigationType {
  SURAH = 'surah',
  JUZ = 'juz',
  AYAH = 'ayah',
  RUB_EL_HIZB = 'rub_el_hizb',
  SEARCH_PAGE = 'search_page',
  PAGE = 'page',
}

export interface SearchNavigationResult {
  resultType: SearchNavigationType;
  name: string;
  key: number | string;
}
