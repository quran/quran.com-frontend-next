import React from 'react';

import classNames from 'classnames';

import Header from './Header';
import styles from './PreInput.module.scss';
import SearchQuerySuggestion from './SearchQuerySuggestion';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import AdvancedSearchLink from 'src/components/Navbar/SearchDrawer/AdvancedSearchLink';
import SearchHistory from 'src/components/Search/SearchHistory';
import { getSurahNavigationUrl } from 'src/utils/navigation';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
  isSearchDrawer: boolean;
}

const POPULAR_SEARCH_QUERIES = { Mulk: 67, Noah: 71, Kahf: 18, Yaseen: 36 };
const SEARCH_FOR_KEYWORDS = ['Juz 1', 'Page 1', 'Surah Yasin', '36', '2:255'];

const PreInput: React.FC<Props> = ({ onSearchKeywordClicked, isSearchDrawer }) => (
  <div className={styles.container}>
    <div className={classNames({ [styles.mainBodyContainer]: isSearchDrawer })}>
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
      <SearchHistory onSearchKeywordClicked={onSearchKeywordClicked} />
      <Header text="Try searching for" />
      {SEARCH_FOR_KEYWORDS.map((keyword) => (
        <SearchQuerySuggestion
          searchQuery={keyword}
          key={keyword}
          onSearchKeywordClicked={onSearchKeywordClicked}
        />
      ))}
    </div>
    {isSearchDrawer && <AdvancedSearchLink />}
  </div>
);

export default PreInput;
