import { BaseResponse } from '../ApiResponses';
import { SearchNavigationResult } from '../SearchNavigationResult';

import SearchVerseItem from './SearchVerseItem';

interface SearchResponse extends BaseResponse {
  result: {
    navigation: SearchNavigationResult[];
    verses: SearchVerseItem[];
  };
  pagination: {
    perPage: number;
    currentPage: number;
    nextPage: number | null;
    totalRecords: number;
    totalPages: number;
  };
}

export default SearchResponse;
