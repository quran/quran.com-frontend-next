import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SearchHistory.module.scss';

import Header from 'src/components/Search/PreInput/Header';
import SearchQuerySuggestion from 'src/components/Search/PreInput/SearchQuerySuggestion';
import { removeSearchHistoryRecord, selectSearchHistory } from 'src/redux/slices/Search/search';
import { areArraysEqual } from 'src/utils/array';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
}

const SearchHistory: React.FC<Props> = ({ onSearchKeywordClicked }) => {
  const { t } = useTranslation('common');
  const searchHistory = useSelector(selectSearchHistory, areArraysEqual);
  const dispatch = useDispatch();

  const onRemoveSearchQueryClicked = useCallback(
    (searchQuery: string) => {
      dispatch({ type: removeSearchHistoryRecord.type, payload: searchQuery });
    },
    [dispatch],
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
          searchQuery={recentSearchQuery}
          key={`${recentSearchQuery}`}
          onSearchKeywordClicked={onSearchKeywordClicked}
          onRemoveSearchQueryClicked={onRemoveSearchQueryClicked}
        />
      ))}
    </div>
  );
};

export default SearchHistory;
