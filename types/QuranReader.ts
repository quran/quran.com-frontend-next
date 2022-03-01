export enum WordByWordType {
  Translation = 'translation',
  Transliteration = 'transliteration',
}

export enum ReadingPreference {
  Translation = 'translation', // Displays verse by verse with translation
  Reading = 'reading', // Displays the Quran text only similar to a physical Quran page without any translations.
}

export enum WordClickFunctionality {
  PlayAudio = 'play-audio',
  NoAudio = 'no-audio',
}

export enum QuranReaderDataType {
  Chapter = 'chapter',
  Verse = 'verse',
  VerseRange = 'range',
  Tafsir = 'tafsir',
  SelectedTafsir = 'selectedTafsir',
  Hizb = 'hizb',
  Juz = 'juz',
  Rub = 'rub',
  Page = 'page',
}

export enum QuranFont {
  MadaniV1 = 'code_v1',
  MadaniV2 = 'code_v2',
  Uthmani = 'text_uthmani',
  IndoPak = 'text_indopak',
  QPCHafs = 'qpc_uthmani_hafs',
  Tajweed = 'tajweed',
}
export const FALLBACK_FONT = QuranFont.QPCHafs;

export enum MushafLines {
  FifteenLines = '15_lines',
  SixteenLines = '16_lines',
}

export enum Mushaf {
  QCFV2 = 1,
  QCFV1 = 2,
  Indopak = 3,
  UthmaniHafs = 4,
  KFGQPCHAFS = 5,
  Indopak15Lines = 6,
  Indopak16Lines = 7,
  Tajweeed = 11,
}

export const QuranFontMushaf: Record<QuranFont, Mushaf> = {
  [QuranFont.MadaniV1]: Mushaf.QCFV1,
  [QuranFont.MadaniV2]: Mushaf.QCFV2,
  [QuranFont.Uthmani]: Mushaf.UthmaniHafs,
  [QuranFont.IndoPak]: Mushaf.Indopak,
  [QuranFont.QPCHafs]: Mushaf.KFGQPCHAFS,
  [QuranFont.Tajweed]: Mushaf.Tajweeed,
};

export default { ReadingPreference, QuranFont };
