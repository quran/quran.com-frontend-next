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
  TajweedV4 = 'tajweed_v4',
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

export enum MushafID {
  QCFV2 = 1,
  QCFV1 = 2,
  Indopak = 3,
  UthmaniHafs = 4,
  KFGQPCHAFS = 5,
  Indopak15Lines = 6,
  Indopak16Lines = 7,
  Tajweeed = 11,
  QCFTajweedV4 = 1, // TODO: revert this back and add ID 17 when BE is ready
}

export const QuranFontMushaf: Record<QuranFont, MushafID> = {
  [QuranFont.MadaniV1]: MushafID.QCFV1,
  [QuranFont.MadaniV2]: MushafID.QCFV2,
  [QuranFont.TajweedV4]: MushafID.QCFTajweedV4,
  [QuranFont.Uthmani]: MushafID.UthmaniHafs,
  [QuranFont.IndoPak]: MushafID.Indopak,
  [QuranFont.QPCHafs]: MushafID.KFGQPCHAFS,
  [QuranFont.Tajweed]: MushafID.Tajweeed,
};

export enum WordByWordDisplay {
  INLINE = 'inline',
  TOOLTIP = 'tooltip',
}

export default { ReadingPreference, QuranFont };
