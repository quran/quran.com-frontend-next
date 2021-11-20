interface SearchResult {
  queryText: string;
  matches?: {
    arabicAyah: string;
    arabicSurahName: string;
    ayahNum: number;
    surahNum: number;
    translationSurahName: string;
  }[];
}

export default SearchResult;
