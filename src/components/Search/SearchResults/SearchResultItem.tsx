/* eslint-disable react/no-danger */

import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SearchResultItem.module.scss';

import Link from 'src/components/dls/Link/Link';
import QuranWord from 'src/components/dls/QuranWord/QuranWord';
import PlainVerseText from 'src/components/Verse/PlainVerseText';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { getChapterWithStartingVerseUrl } from 'src/utils/navigation';
import Verse from 'types/Verse';

export enum Source {
  SearchDrawer = 'search_drawer',
  SearchPage = 'search_page',
  Tarteel = 'tarteel',
}

interface Props {
  result: Verse;
  source: Source;
}

const SearchResultItem: React.FC<Props> = ({ result, source }) => {
  const { lang } = useTranslation('quran-reader');
  const localizedVerseKey = useMemo(
    () => toLocalizedVerseKey(result.verseKey, lang),
    [lang, result.verseKey],
  );
  return (
    <Link
      href={getChapterWithStartingVerseUrl(result.verseKey)}
      shouldPassHref
      onClick={() => {
        logButtonClick(`${source}_result_item`);
      }}
    >
      <a className={styles.link}>
        <div className={styles.itemContainer}>
          <div className={styles.quranTextContainer}>
            <p className={styles.verseKey}>{localizedVerseKey}</p>
            <div className={styles.quranTextResult} translate="no">
              <PlainVerseText words={result.words} />
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
