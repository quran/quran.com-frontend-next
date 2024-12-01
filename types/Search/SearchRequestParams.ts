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
  highlight?: SearchBoolean;
}

export type SearchRequestParams<Mode extends SearchMode> = {
  mode: SearchMode;
  query: string;
  size?: number;
  page?: number;
  getText?: SearchBoolean;
  filterLanguages?: string;
  fields?: string;
  translationFields?: string;
  words?: boolean;
} & (Mode extends SearchMode.Advanced ? AdvancedSearchRequestParams : QuickSearchRequestParams);
