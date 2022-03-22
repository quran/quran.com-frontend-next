import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import Link from '../dls/Link/Link';

import styles from './RecentReadingSessions.module.scss';

import SurahPreview, { SurahPreviewDisplay } from 'src/components/dls/SurahPreview/SurahPreview';
import DataContext from 'src/contexts/DataContext';
import { selectRecentReadingSessions } from 'src/redux/slices/QuranReader/readingTracker';
import { getChapterData } from 'src/utils/chapter';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { getChapterWithStartingVerseUrl } from 'src/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

const RecentReadingSessions = () => {
  const { t, lang } = useTranslation('home');
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);
  const verseKeys = Object.keys(recentReadingSessions);
  const chaptersData = useContext(DataContext);
  const onRecentReadingSessionClicked = () => {
    logButtonClick('homepage_recently_read_card');
  };
  return (
    <>
      {verseKeys.length > 0 && (
        <div className={styles.sessionsContainer}>
          <p className={styles.sessionsHeader}>{t('recently-read')}</p>
          <div className={styles.verseLinksContainer}>
            {verseKeys.map((verseKey) => {
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
