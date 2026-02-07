/**
 * Layered Translation type definitions.
 * These types match the camelized response from:
 * GET /api/qdc/layered_translations/by_verse/:verseKey
 */

export interface LayeredTranslationVerse {
  verseKey: string;
  chapterNumber: number;
  verseNumber: number;
}

export interface LayeredTranslationResource {
  id: number;
  name: string;
  language: string | null;
}

export interface LayeredTranslationTextToken {
  type: 'text';
  html: string;
}

export interface LayeredTranslationAltGroupToken {
  type: 'alt_group';
  groupKey: string;
}

export type LayeredTranslationToken = LayeredTranslationTextToken | LayeredTranslationAltGroupToken;

export interface LayeredTranslationOption {
  optionKey: string;
  position: number;
  collapsedHtml: string;
  expandedHtml: string;
}

export interface LayeredTranslationDependency {
  verseKey: string;
  groupKey: string;
}

export interface LayeredTranslationGroup {
  groupKey: string;
  position: number;
  defaultOptionKey: string;
  explanationHtml: string | null;
  dependency: LayeredTranslationDependency | null;
  options: LayeredTranslationOption[];
}

export interface LayeredTranslationMeta {
  requestedLanguage: string | null;
  resolvedLanguage: string | null;
  fallbackUsed: boolean;
  generatedAt: string;
}

export interface LayeredTranslationApiResponse {
  verse: LayeredTranslationVerse;
  resource: LayeredTranslationResource;
  collapsedTemplate: string;
  expandedTemplate: string;
  collapsedTokens: LayeredTranslationToken[];
  expandedTokens: LayeredTranslationToken[];
  groups: LayeredTranslationGroup[];
  meta: LayeredTranslationMeta;
}
