/* eslint-disable react/no-danger */

import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SearchResultItem.module.scss';

import Link from '@/dls/Link/Link';
import QuranWord from '@/dls/QuranWord/QuranWord';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { getChapterNumberFromKey } from '@/utils/verse';
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

  const chaptersData = useGetChaptersData(lang);

  if (!chaptersData) return null;

  const chapterNumber = getChapterNumberFromKey(result.verseKey);
  const chapterData = getChapterData(chaptersData, chapterNumber.toString());

  return (
    <div className={styles.container}>
      <div className={styles.itemContainer}>
        <Link
          href={getChapterWithStartingVerseUrl(result.verseKey)}
          shouldPassHref
          onClick={() => {
            logButtonClick(`${source}_result_item`);
          }}
        >
          <a className={styles.verseKey}>
            {chapterData.transliteratedName} {localizedVerseKey}
          </a>
        </Link>
        <div className={styles.quranTextContainer}>
          <div className={styles.quranTextResult} translate="no">
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
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <p className={styles.translationName}> - {translation.resourceName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SearchResultItem;
