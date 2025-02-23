import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import NoResults from './NoResults';
import PreInput from './PreInput';
import styles from './SearchBodyContainer.module.scss';

import SearchResults from '@/components/Search/SearchResults';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import SearchQuerySource from '@/types/SearchQuerySource';
import { SearchResponse } from 'types/ApiResponses';

interface Props {
  searchQuery: string;
  isSearching: boolean;
  hasError: boolean;
  searchResult: SearchResponse;
  onSearchKeywordClicked: (keyword: string) => void;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  shouldSuggestFullSearchWhenNoResults?: boolean;
  source: SearchQuerySource;
}

const SearchBodyContainer: React.FC<Props> = ({
  searchQuery,
  isSearching,
  hasError,
  searchResult,
  onSearchKeywordClicked,
  currentPage,
  pageSize,
  onPageChange,
  shouldSuggestFullSearchWhenNoResults = false,
  source,
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
        <PreInput onSearchKeywordClicked={onSearchKeywordClicked} source={source} />
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
                    <NoResults
                      searchQuery={searchQuery}
                      shouldSuggestFullSearchWhenNoResults={shouldSuggestFullSearchWhenNoResults}
                    />
                  ) : (
                    <SearchResults
                      searchResult={searchResult}
                      searchQuery={searchQuery}
                      source={source}
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
