export interface SearchRequest {
  query: string;
  language: string;
  size?: number;
  page?: number;
}

export interface AdvancedCopyRequest {
  from: string;
  to: string;
  footnote: boolean;
  translations?: string;
  fields?: string;
  raw: boolean;
}
