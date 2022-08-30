import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import KalimatSearchNavigation from '../KalimatSearchNavigation';

import SearchResultItem, { Source } from './SearchResultItem';
import styles from './SearchResults.module.scss';

import Link from 'src/components/dls/Link/Link';
import Pagination from 'src/components/dls/Pagination/Pagination';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { VersesResponse } from 'types/ApiResponses';

interface Props {
  searchResult: VersesResponse;
  searchQuery: string;
  isSearchDrawer?: boolean;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onSearchResultClicked?: () => void;
  showFeedbackButtons?: boolean;
}

const SearchResults: React.FC<Props> = ({
  searchResult,
  searchQuery,
  isSearchDrawer = true,
  currentPage,
  onPageChange,
  pageSize,
  onSearchResultClicked,
  showFeedbackButtons,
}) => {
  const { t, lang } = useTranslation();
  return (
    <>
      <div>
        <p className={styles.header}>
          {t('common:search-results', {
            count: toLocalizedNumber(
              searchResult.pagination.totalRecords + Number(searchResult?.chapters?.length),
              lang,
            ),
          })}
        </p>
        <>
          {!!searchResult.chapters?.length && (
            <div className={styles.navigationItemsListContainer}>
              {searchResult?.chapters.map((chapterId) => (
                <span className={styles.navigationItemContainer} key={chapterId}>
                  <KalimatSearchNavigation
                    chapterId={chapterId}
                    isSearchDrawer={isSearchDrawer}
                    searchQuery={searchQuery}
                  />
                </span>
              ))}
            </div>
          )}
          {searchResult.verses.map((result) => (
            <SearchResultItem
              key={result.verseKey}
              result={result}
              source={isSearchDrawer ? Source.SearchDrawer : Source.SearchPage}
              searchQuery={searchQuery}
              showFeedbackButtons={showFeedbackButtons}
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
