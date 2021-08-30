import Link from 'next/link';
import React from 'react';
import Pagination from 'src/components/dls/Pagination/Pagination';
import { SearchResponse } from 'types/APIResponses';
import NavigationItem from '../NavigationItem';
import SearchResultItem from './SearchResultItem';
import styles from './SearchResults.module.scss';

interface Props {
  isSearching: boolean;
  hasError: boolean;
  searchResult: SearchResponse;
  searchQuery: string;
  isSearchDrawer?: boolean;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const SearchResults: React.FC<Props> = ({
  isSearching,
  hasError,
  searchResult,
  searchQuery,
  isSearchDrawer = true,
  currentPage,
  onPageChange,
  pageSize,
}) => (
  <>
    {isSearching && <div>Searching...</div>}
    {!isSearching && hasError && <div>Something went wrong, please try again!</div>}
    {!isSearching && !hasError && searchResult && (
      <div>
        {!!searchResult.result.navigation?.length && (
          <>
            <p className={styles.boldHeader}>Jump To</p>
            {searchResult.result.navigation.map((navigationResult) => (
              <NavigationItem key={navigationResult.key} navigation={navigationResult} />
            ))}
          </>
        )}
        <p className={styles.boldHeader}>Results</p>
        {searchResult.pagination.totalRecords === 0 ? (
          <p>No results found!</p>
        ) : (
          <>
            {searchResult.result.verses.map((result) => (
              <SearchResultItem key={result.verseId} result={result} />
            ))}
            {isSearchDrawer ? (
              <div className={styles.resultsSummaryContainer}>
                <p>{searchResult.pagination.totalRecords} results</p>
                {searchResult.pagination.totalRecords > 0 && (
                  <Link href={`/search?query=${searchQuery}`} passHref>
                    <a>
                      <p>Show all results</p>
                    </a>
                  </Link>
                )}
              </div>
            ) : (
              <>
                {searchQuery && (
                  <Pagination
                    currentPage={currentPage}
                    totalCount={searchResult.pagination.totalRecords}
                    onPageChange={onPageChange}
                    pageSize={pageSize}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    )}
  </>
);

export default SearchResults;
