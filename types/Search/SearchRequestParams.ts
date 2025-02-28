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
}

export type SearchRequestParams<Mode extends SearchMode> = {
  mode: SearchMode;
  query: string;
  size?: number;
  page?: number;
  perPage?: number;
  getText?: SearchBoolean;
  translationIds?: string;
  fields?: string;
  translationFields?: string;
  words?: boolean;
  highlight?: SearchBoolean;
} & (Mode extends SearchMode.Advanced ? AdvancedSearchRequestParams : QuickSearchRequestParams);
