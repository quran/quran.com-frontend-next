import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import SearchResultItem, { Source } from './SearchResultItem';
import styles from './SearchResults.module.scss';

import Link from 'src/components/dls/Link/Link';
import Pagination from 'src/components/dls/Pagination/Pagination';
import NavigationItem from 'src/components/Search/NavigationItem';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { SearchResponse } from 'types/ApiResponses';

interface Props {
  searchResult: SearchResponse;
  searchQuery: string;
  isSearchDrawer?: boolean;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearchResultClicked?: () => void;
}

const SearchResults: React.FC<Props> = ({
  searchResult,
  searchQuery,
  isSearchDrawer = true,
  currentPage,
  onPageChange,
  pageSize,
  onSearchResultClicked,
}) => {
  const { t, lang } = useTranslation('common');
  return (
    <>
      <div>
        {!!searchResult.result.navigation?.length && (
          <>
            <p className={styles.boldHeader}>{t('search.jump-to')}</p>
            {searchResult.result.navigation.map((navigationResult) => (
              <NavigationItem
                isSearchDrawer={isSearchDrawer}
                key={navigationResult.key}
                navigation={navigationResult}
              />
            ))}
          </>
        )}
        <p className={styles.boldHeader}>{t('search.results')}</p>
        <>
          {searchResult.result.verses.map((result) => (
            <SearchResultItem
              key={result.verseKey}
              result={result}
              source={isSearchDrawer ? Source.SearchDrawer : Source.SearchPage}
            />
          ))}
          {isSearchDrawer ? (
            <div className={styles.resultsSummaryContainer}>
              <p>
                {toLocalizedNumber(searchResult.pagination.totalRecords, lang)}{' '}
                {t('search.results')}
              </p>
              {searchResult.pagination.totalRecords > 0 && (
                <Link
                  href={`/search?query=${searchQuery}`}
                  passHref
                  onClick={() => {
                    if (onSearchResultClicked) onSearchResultClicked();
                    logButtonClick('search_drawer_show_all');
                  }}
                >
                  <a>
                    <p className={styles.showAll}>{t('search.show-all')}</p>
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
