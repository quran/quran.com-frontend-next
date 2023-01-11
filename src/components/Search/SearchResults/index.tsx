import React from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import SearchResultItem, { Source } from './SearchResultItem';
import styles from './SearchResults.module.scss';

import NavigationItem from '@/components/Search/NavigationItem';
import Link from '@/dls/Link/Link';
import Pagination from '@/dls/Pagination/Pagination';
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
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  return (
    <>
      <div>
        {!!searchResult.result.navigation?.length && (
          <div className={styles.navigationItemsListContainer}>
            {searchResult.result.navigation.map((navigationResult) => (
              <span className={styles.navigationItemContainer} key={navigationResult.key}>
                <NavigationItem isSearchDrawer={isSearchDrawer} navigation={navigationResult} />
              </span>
            ))}
          </div>
        )}
        <p className={styles.header}>
          {t('search-results', {
            // TODO: find a typesafe way
            count: toLocalizedNumber(
              searchResult.pagination.totalRecords,
              locale,
            ) as unknown as number,
          })}
        </p>
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
                {toLocalizedNumber(searchResult.pagination.totalRecords, locale)}{' '}
                {t('common:search.results')}
              </p>
              {searchResult.pagination.totalRecords > 0 && (
                <Link
                  href={`/search?query=${searchQuery}`}
                  onClick={() => {
                    if (onSearchResultClicked) onSearchResultClicked();
                    logButtonClick('search_drawer_show_all');
                  }}
                >
                  <p className={styles.showAll}>{t('common:search.show-all')}</p>
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
