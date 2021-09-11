import React from 'react';
import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { getSurahNavigationUrl } from 'src/utils/navigation';
import AdvancedSearchLink from '../AdvancedSearchLink';
import styles from './PreInput.module.scss';
import RecentSearchQueries from '../RecentSearchQueries';
import Header from './Header';
import SearchQuerySuggestion from './SearchQuerySuggestion';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
}

const POPULAR_SEARCH_QUERIES = { Mulk: 67, Noah: 71, Kahf: 18, Yaseen: 36 };
const SEARCH_FOR_KEYWORDS = ['Juz 1', 'Page 1', 'Surah Yasin', '36', '2:255'];

const PreInput: React.FC<Props> = ({ onSearchKeywordClicked }) => (
  <div className={styles.container}>
    <div className={styles.mainBodyContainer}>
      <RecentSearchQueries onSearchKeywordClicked={onSearchKeywordClicked} />
      <Header text="Popular searches" />
      <div className={styles.popularSearchesContainer}>
        {Object.keys(POPULAR_SEARCH_QUERIES).map((searchQuery) => {
          const url = getSurahNavigationUrl(POPULAR_SEARCH_QUERIES[searchQuery]);
          return (
            <Button
              size={ButtonSize.Small}
              type={ButtonType.Secondary}
              key={searchQuery}
              href={url}
            >
              <p>{searchQuery}</p>
            </Button>
          );
        })}
      </div>
      <Header text="Try searching for" />
      {SEARCH_FOR_KEYWORDS.map((keyword) => (
        <SearchQuerySuggestion
          searchQuery={keyword}
          key={keyword}
          onSearchKeywordClicked={onSearchKeywordClicked}
        />
      ))}
    </div>
    <AdvancedSearchLink />
  </div>
);

export default PreInput;
