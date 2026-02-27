export type UiSectionContentFormat = 'plain_text' | 'html';

export interface UiSectionContent {
  format: UiSectionContentFormat;
  value: string;
}

export interface UiSection {
  key: string;
  url?: string;
  ctaText?: string | null;
  cacheTtlSeconds: number;
  metadata: Record<string, unknown>;
  content: UiSectionContent;
  language: string;
}
