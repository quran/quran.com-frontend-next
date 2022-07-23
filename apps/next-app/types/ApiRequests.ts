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
  translatorName: boolean;
  translations?: string;
  mushaf?: number;
  fields?: string;
  raw: boolean;
};

export type PagesLookUpRequest = {
  chapterNumber?: number;
  juzNumber?: number;
  pageNumber?: number;
  manzilNumber?: number;
  rubElHizbNumber?: number;
  hizbNumber?: number;
  rukuNumber?: number;
  mushaf?: number;
  from?: number | string;
  to?: number | string;
};
