export enum ReadingView {
  Translation = 'translation', // Displays verse by verse with translation
  QuranPage = 'quranPage', // Displays the Quran text only similar to a physical Quran page
}

export enum QuranFont {
  MadaniV1 = 'code_v1',
  MadaniV2 = 'code_v2',
  Uthmani = 'text_uthmani',
  IndoPak = 'text_indopak',
}

export default { ReadingView, QuranFont };
