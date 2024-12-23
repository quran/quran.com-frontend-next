import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SearchHistory.module.scss';

import Header from '@/components/Search/PreInput/Header';
import SearchQuerySuggestion from '@/components/Search/PreInput/SearchQuerySuggestion';
import { removeSearchHistoryRecord, selectSearchHistory } from '@/redux/slices/Search/search';
import { SearchNavigationType } from '@/types/Search/SearchNavigationResult';
import SearchQuerySource from '@/types/SearchQuerySource';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
  source: SearchQuerySource;
}

const SearchHistory: React.FC<Props> = ({ onSearchKeywordClicked, source }) => {
  const { t } = useTranslation('common');
  const searchHistory = useSelector(selectSearchHistory, areArraysEqual) as string[];
  const dispatch = useDispatch();

  const onRemoveSearchQueryClicked = useCallback(
    (searchQuery: string) => {
      // eslint-disable-next-line i18next/no-literal-string
      logButtonClick(`${source}_remove_query`);
      dispatch({ type: removeSearchHistoryRecord.type, payload: searchQuery });
    },
    [dispatch, source],
  );

  // if there are no recent search queries.
  if (!searchHistory.length) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <Header text={t('search.recent')} />
      {searchHistory.map((recentSearchQuery) => (
        <SearchQuerySuggestion
          type={SearchNavigationType.HISTORY}
          searchQuery={recentSearchQuery}
          key={`${recentSearchQuery}`}
          onSearchKeywordClicked={(searchQuery: string) => {
            logButtonClick(`${source}_history_item`);
            onSearchKeywordClicked(searchQuery);
          }}
          onRemoveSearchQueryClicked={onRemoveSearchQueryClicked}
        />
      ))}
    </div>
  );
};

export default SearchHistory;
