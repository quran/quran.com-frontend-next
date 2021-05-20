export enum ReadingView {
  Translation = 'translation', // Displays verse by verse with translation
  QuranPage = 'quranPage', // Displays the Quran text only similar to a physical Quran page
}

export enum QuranFont {
  Uthmani = 'text_uthmani',
  MadaniV1 = 'code_v1',
  MadaniV2 = 'code_v2',
  IndoPak = 'text_indopak',
}

export default { ReadingView, QuranFont };
