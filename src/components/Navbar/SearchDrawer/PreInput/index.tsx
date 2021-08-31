import React from 'react';
import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { getSurahNavigationUrl } from 'src/utils/navigation';
import AdvancedSearchLink from '../AdvancedSearchLink';
import styles from './PreInput.module.scss';

interface Props {
  setSearchQuery: (searchQuery: string) => void;
}

const POPULAR_SEARCH_QUERIES = { Mulk: 67, Noah: 71, Kahf: 18, Yaseen: 36 };
const SEARCH_FOR_KEYWORDS = ['Juz 1', 'Page 1', 'Surah Yasin', '36', '2:255'];

const PreInput: React.FC<Props> = ({ setSearchQuery }) => (
  <>
    <p className={styles.header}>Popular searches</p>
    <div className={styles.popularSearchesContainer}>
      {Object.keys(POPULAR_SEARCH_QUERIES).map((searchQuery) => {
        const url = getSurahNavigationUrl(POPULAR_SEARCH_QUERIES[searchQuery]);
        return (
          <Button size={ButtonSize.Small} type={ButtonType.Secondary} key={searchQuery} href={url}>
            <p style={{ textAlign: 'center' }}>{searchQuery}</p>
          </Button>
        );
      })}
    </div>
    <p className={styles.header}>Try searching for</p>
    {SEARCH_FOR_KEYWORDS.map((keyword) => (
      <button
        type="button"
        key={keyword}
        className={styles.keywordButton}
        onClick={() => setSearchQuery(keyword)}
      >
        {keyword}
      </button>
    ))}
    <AdvancedSearchLink />
  </>
);

export default PreInput;
