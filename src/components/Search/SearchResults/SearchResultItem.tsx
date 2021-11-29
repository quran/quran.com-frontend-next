/* eslint-disable react/no-danger */

import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

import styles from './SearchResultItem.module.scss';

import QuranWord from 'src/components/dls/QuranWord/QuranWord';
import { toLocalizedNumber } from 'src/utils/locale';
import { getVerseNavigationUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';

interface Props {
  result: Verse;
}

const SearchResultItem: React.FC<Props> = ({ result }) => {
  const { lang } = useTranslation('quran-reader');
  const localizedVerseKey = useMemo(() => {
    return result.verseKey
      .split(':')
      .map((value) => toLocalizedNumber(Number(value), lang))
      .join(':');
  }, [lang, result.verseKey]);
  return (
    <Link href={getVerseNavigationUrl(result.verseKey)} passHref>
      <a className={styles.link}>
        <div className={styles.itemContainer}>
          <div className={styles.quranTextContainer}>
            <p className={styles.verseKey}>{localizedVerseKey}</p>
            <div className={styles.quranTextResult}>
              {result.words.map((word, index) => {
                return (
                  <QuranWord
                    isHighlighted={!!word.highlight}
                    key={`${result.verseKey}:${index + 1}`}
                    word={word}
                    isWordByWordAllowed={false}
                    isAudioHighlightingAllowed={false}
                  />
                );
              })}
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
};
export default SearchResultItem;
