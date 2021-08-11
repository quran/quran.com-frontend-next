/* eslint-disable react/no-danger */
import React from 'react';
import SearchResult from 'types/SearchResult';
import styles from './SearchResultItem.module.scss';

interface Props {
  result: SearchResult;
}

const SearchResultItem: React.FC<Props> = ({ result }) => (
  <div className={styles.itemContainer}>
    <div className={styles.quranTextContainer}>
      <div>VerseKey</div>
      <div className={styles.quranTextResult} dangerouslySetInnerHTML={{ __html: result.text }} />
    </div>
    {result.translations.map((translation) => (
      <div key={translation.id} className={styles.translationContainer}>
        <div dangerouslySetInnerHTML={{ __html: translation.text }} />
        <p className={styles.translationName}>{translation.name}</p>
      </div>
    ))}
  </div>
);

export default SearchResultItem;
