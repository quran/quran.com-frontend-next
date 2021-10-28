import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import Link from '../dls/Link/Link';

import styles from './RecentReadingSessions.module.scss';

import SurahPreview, { SurahPreviewDisplay } from 'src/components/dls/SurahPreview/SurahPreview';
import { selectRecentReadingSessions } from 'src/redux/slices/QuranReader/readingTracker';
import { getChapterData } from 'src/utils/chapter';
import { getVerseToEndOfChapterNavigationUrl } from 'src/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

const RecentReadingSessions = () => {
  const { t } = useTranslation('home');
  const recentReadingSessions = useSelector(selectRecentReadingSessions, shallowEqual);
  const verseKeys = Object.keys(recentReadingSessions);
  return (
    <>
      {verseKeys.length > 0 && (
        <div className={styles.sessionsContainer}>
          <p className={styles.sessionsHeader}>{t('recently-read')}</p>
          <div className={styles.verseLinksContainer}>
            {verseKeys.map((verseKey) => {
              const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
              const surah = getChapterData(chapterId);
              return (
                <div className={styles.verseLink} key={verseKey}>
                  <Link href={getVerseToEndOfChapterNavigationUrl(verseKey)}>
                    <SurahPreview
                      display={SurahPreviewDisplay.Block}
                      chapterId={Number(surah.id)}
                      surahNumber={Number(surah.id)}
                      translatedSurahName={surah.translatedName.name}
                      surahName={surah.nameSimple}
                      description={`${t('common:ayah')} ${verseNumber}`}
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
