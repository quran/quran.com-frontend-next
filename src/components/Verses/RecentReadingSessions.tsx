import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Link from '../dls/Link/Link';

import styles from './RecentReadingSessions.module.scss';
import RecentReadingSessionsSkeleton from './RecentReadingSessionsSkeleton';

import SurahPreview, { SurahPreviewDisplay } from '@/dls/SurahPreview/SurahPreview';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

const RecentReadingSessions = () => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);
  const { recentlyReadVerseKeys, isLoading } = useGetRecentlyReadVerseKeys();
  const onRecentReadingSessionClicked = () => {
    logButtonClick('recently_read_card');
  };

  if (isLoading) {
    return (
      <div className={styles.sessionsContainer} id="reading-sessions">
        <p className={styles.sessionsHeader}>{t('recently-read')}</p>
        <div className={styles.verseLinksContainer}>
          <RecentReadingSessionsSkeleton />
        </div>
      </div>
    );
  }

  if (recentlyReadVerseKeys.length === 0) return null;

  return (
    <div className={styles.sessionsContainer} id="reading-sessions">
      <p className={styles.sessionsHeader}>{t('recently-read')}</p>
      <div className={styles.verseLinksContainer}>
        {recentlyReadVerseKeys.map((verseKey) => {
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
                />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentReadingSessions;
