export type SearchRequest = {
  query: string;
  filterLanguages?: string;
  filterTranslations?: string;
  size?: number;
  page?: number;
};

export type AdvancedCopyRequest = {
  from: string;
  to: string;
  footnote: boolean;
  includeTranslator: boolean;
  translations?: string;
  mushaf?: number;
  fields?: string;
  raw: boolean;
};
