/* eslint-disable react/no-danger */
import Link from 'next/link';
import React from 'react';
import QuranWord from 'src/components/dls/QuranWord/QuranWord';
import { getVerseNavigationUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';
import styles from './SearchResultItem.module.scss';

interface Props {
  result: Verse;
}

const SearchResultItem: React.FC<Props> = ({ result }) => (
  <Link href={getVerseNavigationUrl(result.verseKey)} passHref>
    <a className={styles.link}>
      <div className={styles.itemContainer}>
        <div className={styles.quranTextContainer}>
          <p className={styles.verseKey}>{result.verseKey}</p>
          <div className={styles.quranTextResult}>
            {result.words.map((word, index) => (
              <QuranWord
                isHighlight={!!word.highlight}
                key={`${result.verseKey}:${index + 1}`}
                word={word}
                isWordByWordAllowed={false}
              />
            ))}
          </div>
        </div>
        {result.translations?.map((translation) => (
          <div key={translation.resourceId} className={styles.translationContainer}>
            <div dangerouslySetInnerHTML={{ __html: translation.text }} />
            <p className={styles.translationName}> - {translation.resourceName}</p>
          </div>
        ))}
      </div>
    </a>
  </Link>
);
export default SearchResultItem;
