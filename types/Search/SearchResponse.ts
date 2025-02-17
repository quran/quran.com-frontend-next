import { BaseResponse, Pagination } from '../ApiResponses';

import { SearchNavigationResult } from './SearchNavigationResult';
import SearchVerseItem from './SearchVerseItem';

interface SearchResponse extends BaseResponse {
  result: {
    navigation: SearchNavigationResult[];
    verses: SearchVerseItem[];
  };
  pagination: Pagination;
}

export default SearchResponse;
