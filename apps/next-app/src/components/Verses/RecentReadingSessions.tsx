import React, { useContext, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import Link from '../dls/Link/Link';

import styles from './RecentReadingSessions.module.scss';

import SurahPreview, { SurahPreviewDisplay } from 'src/components/dls/SurahPreview/SurahPreview';
import DataContext from 'src/contexts/DataContext';
import { selectRecentReadingSessions } from 'src/redux/slices/QuranReader/readingTracker';
import { privateFetcher } from 'src/utils/auth/api';
import { makeReadingSessionsUrl } from 'src/utils/auth/apiPaths';
import { isLoggedIn } from 'src/utils/auth/login';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { getChapterWithStartingVerseUrl } from 'src/utils/navigation';
import { getVerseAndChapterNumbersFromKey, makeVerseKey } from 'src/utils/verse';
import ReadingSession from 'types/ReadingSession';

const RecentReadingSessions = () => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);
  const onRecentReadingSessionClicked = () => {
    logButtonClick('homepage_recently_read_card');
  };

  const { data } = useSWRImmutable<ReadingSession[]>(
    isLoggedIn() ? makeReadingSessionsUrl() : null,
    privateFetcher,
  );

  const recentReadVerseKeys = useMemo(() => {
    if (!isLoggedIn()) {
      return Object.keys(recentReadingSessions);
    }

    if (isLoggedIn() && data?.length > 0) {
      return data.map((item) => makeVerseKey(item.chapterNumber, item.verseNumber));
    }

    return [];
  }, [data, recentReadingSessions]);

  if (recentReadVerseKeys.length === 0) return null;

  return (
    <>
      {recentReadVerseKeys.length > 0 && (
        <div className={styles.sessionsContainer}>
          <p className={styles.sessionsHeader}>{t('recently-read')}</p>
          <div className={styles.verseLinksContainer}>
            {recentReadVerseKeys.map((verseKey) => {
              const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
              const surah = getChapterData(chaptersData, chapterId);
              return (
                <div className={styles.verseLink} key={verseKey}>
                  <Link
                    href={getChapterWithStartingVerseUrl(verseKey)}
                    onClick={onRecentReadingSessionClicked}
                  >
                    <SurahPreview
                      display={SurahPreviewDisplay.Block}
                      chapterId={Number(chapterId)}
                      surahNumber={Number(chapterId)}
                      translatedSurahName={surah.translatedName as string}
                      surahName={surah.transliteratedName}
                      description={`${t('common:ayah')} ${toLocalizedNumber(
                        Number(verseNumber),
                        lang,
                      )}`}
                      verseCount={surah.versesCount}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default RecentReadingSessions;
