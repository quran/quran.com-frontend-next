export type SearchBoolean = 1 | 0;

export enum SearchMode {
  Advanced = 'advanced',
  Quick = 'quick',
}

interface AdvancedSearchRequestParams {
  exactMatchesOnly?: SearchBoolean;
}

interface QuickSearchRequestParams {
  indexes?: string;
  disableHighlighting?: SearchBoolean;
}

export type SearchRequestParams<Mode extends SearchMode> = {
  mode: SearchMode;
  query: string;
  size?: number;
  page?: number;
  getText?: SearchBoolean;
  filterTranslations?: string;
  filterLanguages?: string;
  fields?: string;
  translationFields?: string;
  words?: boolean;
} & (Mode extends SearchMode.Advanced ? AdvancedSearchRequestParams : QuickSearchRequestParams);
