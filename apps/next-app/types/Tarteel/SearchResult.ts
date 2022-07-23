interface SearchResult {
  queryText: string;
  matches?: {
    ayahNum: number;
    surahNum: number;
  }[];
}

export default SearchResult;
