import React from 'react';
import Link from 'next/link';
import SearchResultItem from 'src/components/Search/SearchResultItem';
import { SearchResponse } from 'types/APIResponses';
import styles from './SearchDrawerBody.module.scss';

interface Props {
  isSearching: boolean;
  hasError: boolean;
  searchQuery: string;
  searchResult: SearchResponse;
}

const SearchDrawerBody: React.FC<Props> = ({
  isSearching,
  hasError,
  searchResult,
  searchQuery,
}) => (
  <div className={styles.container}>
    {isSearching && <div>Searching...</div>}
    {!isSearching && hasError && <div>Something went wrong!</div>}
    {!isSearching && !hasError && searchResult && (
      <div>
        <p>Results</p>
        {searchResult.search.results.map((result) => (
          <SearchResultItem key={result.verseId} result={result} />
        ))}
        <div className={styles.resultsSummaryContainer}>
          <p>{searchResult.search.totalResults} results</p>
          {searchResult.search.totalResults > 0 && (
            <Link href={`/search?query=${searchQuery}`} passHref>
              <a>
                <p>Show all results</p>
              </a>
            </Link>
          )}
        </div>
      </div>
    )}
  </div>
);

export default SearchDrawerBody;
