import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import SearchResultItem from './SearchResultItem';
import styles from './SearchResults.module.scss';

import NavigationItem from '@/components/Search/NavigationItem';
import Link from '@/dls/Link/Link';
import Pagination from '@/dls/Pagination/Pagination';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
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
  const { t, lang } = useTranslation();
  return (
    <>
      <div>
        {!!searchResult.result.navigation?.length && (
          <div className={styles.navigationItemsListContainer}>
            {searchResult.result.navigation.map((navigationResult) => (
              <span className={styles.navigationItemContainer} key={navigationResult.key}>
                <NavigationItem
                  isSearchDrawer={isSearchDrawer}
                  navigation={navigationResult}
                  service={searchResult.service}
                />
              </span>
            ))}
          </div>
        )}
        <p className={styles.header}>
          {t('common:search-results', {
            count: toLocalizedNumber(searchResult.pagination.totalRecords, lang),
          })}
        </p>
        <>
          {searchResult.result.verses.map((result) => (
            <SearchResultItem
              key={result.verseKey}
              result={result}
              source={
                isSearchDrawer ? SearchQuerySource.SearchDrawer : SearchQuerySource.SearchPage
              }
              service={searchResult.service}
            />
          ))}
          {isSearchDrawer ? (
            <div className={styles.resultsSummaryContainer}>
              <p>
                {toLocalizedNumber(searchResult.pagination.totalRecords, lang)}{' '}
                {t('common:search.results')}
              </p>
              {searchResult.pagination.totalRecords > 0 && (
                <Link
                  href={`/search?query=${searchQuery}`}
                  shouldPassHref
                  onClick={() => {
                    if (onSearchResultClicked) onSearchResultClicked();
                    logButtonClick('search_drawer_show_all');
                  }}
                >
                  <a>
                    <p className={styles.showAll}>{t('common:search.show-all')}</p>
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
