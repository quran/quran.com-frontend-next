interface SearchResult {
  verseId: number;
  text: string;
  translations?: {
    name: string;
    id: number;
    text: string;
  }[];
}

export default SearchResult;
