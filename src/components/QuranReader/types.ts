export enum WordByWordType {
  Translation = 'translation',
  Transliteration = 'transliteration',
}

export enum ReadingPreference {
  Translation = 'translation', // Displays verse by verse with translation
  Reading = 'reading', // Displays the Quran text only similar to a physical Quran page without any translations.
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
}

export default { ReadingPreference, QuranFont };
