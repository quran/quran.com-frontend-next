export enum SearchNavigationType {
  SURAH = 'surah',
  JUZ = 'juz',
  HIZB = 'hizb',
  AYAH = 'ayah',
  RUB_EL_HIZB = 'rub_el_hizb',
  SEARCH_PAGE = 'search_page',
  PAGE = 'page',
  RANGE = 'range',
}

export interface SearchNavigationResult {
  resultType: SearchNavigationType;
  name: string;
  key: number | string;
  /**
   * This is for the randomly pick command, for example, instead of displaying 'Any surah' under the
   * recent navigations, it should instead display the name of the surah such as 'Surah Al-Fatihah'
   */
  displayName?: string;
}
