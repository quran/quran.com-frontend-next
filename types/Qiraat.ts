/**
 * QF-4167: Qiraat (Variant Readings) Type Definitions
 *
 * These types match the API response from:
 * GET /api/qdc/qiraat/matrix/by_verse/{verseKey}
 *
 * Note: API returns snake_case, frontend uses camelCase (transformed via humps)
 */

export interface QiraatReader {
  id: number;
  name: string;
  translatedName: string;
  abbreviation: string;
  position: number;
  city: string | null;
  bio: string | null;
}

export interface QiraatTransmitter {
  id: number;
  name: string;
  translatedName: string;
  abbreviation: string;
  readerId: number;
  position: number;
  isPrimary: boolean;
}

export interface JunctureSegment {
  id: number;
  verseKey: string;
  verseId: number;
  startWordId: number;
  endWordId: number;
  startWordPosition: number;
  endWordPosition: number;
  text: string;
  position: number;
}

export interface ReadingTranslation {
  id: number;
  text: string;
  source?: string;
}

export interface ReadingExplanation {
  id: number;
  text: string;
  source?: string;
}

export interface ReadingMatrixCell {
  readerId: number;
  transmitterId: number | null;
  type: 'reader' | 'transmitter';
}

export interface ReadingMatrix {
  readers: number[];
  transmitters: number[];
  cells: ReadingMatrixCell[];
}

export interface QiraatReading {
  id: number;
  position: number;
  text: string;
  textUthmani: string;
  textImlaei: string | null;
  grammaticalForm: string | null;
  rootLetters: string | null;
  color: string;
  translation: string | null;
  translations: ReadingTranslation[] | null;
  transliteration: string | null;
  explanation: {
    id?: number;
    text: string;
    source?: string;
  } | null;
  explanations: ReadingExplanation[] | null;
  matrix: ReadingMatrix;
}

export interface QiraatJuncture {
  id: number;
  position: number;
  verseKey: string;
  verseRange: string | null;
  crossVerse: boolean;
  text: string;
  textSimple: string | null;
  category: string | null;
  segments: JunctureSegment[];
  readings: QiraatReading[];
  commentary: string | null;
  combinedTranslation: string | null;
}

export interface QiraatVerse {
  verseKey: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  textField: string;
}

export interface QiraatMeta {
  language: string;
  direction: 'ltr' | 'rtl';
  textField: string;
  totalJunctures: number;
  totalReadings: number;
  generatedAt: string;
}

export interface QiraatApiResponse {
  verse: QiraatVerse;
  readers: QiraatReader[];
  transmitters: QiraatTransmitter[];
  junctures: QiraatJuncture[];
  meta: QiraatMeta;
}

/**
 * Qiraat Card color palette
 * Colors are stored in the database per reading
 */
export const QIRAAT_CARD_COLORS = {
  white: '#FFFFFF',
  green: '#B7D7A8',
  pink: '#EA9999',
  blue: '#A4C2F4',
} as const;

export type QiraatCardColor = keyof typeof QIRAAT_CARD_COLORS;
