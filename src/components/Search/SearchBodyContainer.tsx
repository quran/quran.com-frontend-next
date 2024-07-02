import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import NoResults from './NoResults';
import PreInput from './PreInput';
import styles from './SearchBodyContainer.module.scss';

import SearchResults from '@/components/Search/SearchResults';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { SearchResponse } from 'types/ApiResponses';

interface Props {
  searchQuery: string;
  isSearching: boolean;
  isSearchDrawer?: boolean;
  hasError: boolean;
  searchResult: SearchResponse;
  onSearchKeywordClicked: (keyword: string) => void;
  onSearchResultClicked?: () => void;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const SearchBodyContainer: React.FC<Props> = ({
  searchQuery,
  isSearching,
  hasError,
  searchResult,
  onSearchKeywordClicked,
  onSearchResultClicked,
  isSearchDrawer = true,
  currentPage,
  pageSize,
  onPageChange,
}) => {
  const { t } = useTranslation('common');
  const isEmptyResponse =
    searchResult &&
    searchResult.pagination.totalRecords === 0 &&
    !searchResult.result.navigation.length;
  const isPreInputLayout =
    !searchQuery || isSearching || hasError || (!isSearching && !hasError && isEmptyResponse);
  return (
    <div
      className={classNames({
        [styles.internalContainer]: isPreInputLayout,
      })}
    >
      {!searchQuery ? (
        <PreInput onSearchKeywordClicked={onSearchKeywordClicked} isSearchDrawer={isSearchDrawer} />
      ) : (
        <>
          {isSearching ? (
            <Spinner size={SpinnerSize.Large} />
          ) : (
            <>
              {hasError && <div>{t('error.general')}</div>}
              {!hasError && searchResult && (
                <>
                  {isEmptyResponse ? (
                    <NoResults searchQuery={searchQuery} />
                  ) : (
                    <SearchResults
                      onSearchResultClicked={onSearchResultClicked}
                      searchResult={searchResult}
                      searchQuery={searchQuery}
                      isSearchDrawer={isSearchDrawer}
                      currentPage={currentPage}
                      onPageChange={onPageChange}
                      pageSize={pageSize}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchBodyContainer;
