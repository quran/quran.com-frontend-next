import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

import SearchResultItem from './SearchResultItem';
import styles from './SearchResults.module.scss';

import Pagination from 'src/components/dls/Pagination/Pagination';
import NavigationItem from 'src/components/Search/NavigationItem';
import { SearchResponse } from 'types/ApiResponses';

interface Props {
  searchResult: SearchResponse;
  searchQuery: string;
  isSearchDrawer?: boolean;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const SearchResults: React.FC<Props> = ({
  searchResult,
  searchQuery,
  isSearchDrawer = true,
  currentPage,
  onPageChange,
  pageSize,
}) => {
  const { t } = useTranslation('common');
  return (
    <>
      <div>
        {!!searchResult.result.navigation?.length && (
          <>
            <p className={styles.boldHeader}>{t('search.jump-to')}</p>
            {searchResult.result.navigation.map((navigationResult) => (
              <NavigationItem key={navigationResult.key} navigation={navigationResult} />
            ))}
          </>
        )}
        <p className={styles.boldHeader}>{t('search.results')}</p>
        <>
          {searchResult.result.verses.map((result) => (
            <SearchResultItem key={result.verseKey} result={result} />
          ))}
          {isSearchDrawer ? (
            <div className={styles.resultsSummaryContainer}>
              <p>
                {searchResult.pagination.totalRecords} {t('search.results')}
              </p>
              {searchResult.pagination.totalRecords > 0 && (
                <Link href={`/search?query=${searchQuery}`} passHref>
                  <a>
                    <p>{t('search.show-all')}</p>
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
      </div>
    </>
  );
};

export default SearchResults;
