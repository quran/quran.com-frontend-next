import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import Link from '../dls/Link/Link';

import styles from './RecentReadingSessions.module.scss';

import SurahPreview, { SurahPreviewDisplay } from 'src/components/dls/SurahPreview/SurahPreview';
import { selectRecentReadingSessions } from 'src/redux/slices/QuranReader/readingTracker';
import { getChapterData } from 'src/utils/chapter';
import { toLocalizedNumber } from 'src/utils/locale';
import { getVerseToEndOfChapterNavigationUrl } from 'src/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';

const RecentReadingSessions = () => {
  const { t, lang } = useTranslation('home');
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
              const localizedVerseNumber = toLocalizedNumber(Number(verseNumber), lang);
              const surah = getChapterData(chapterId, lang);
              return (
                <div className={styles.verseLink} key={verseKey}>
                  <Link href={getVerseToEndOfChapterNavigationUrl(verseKey)}>
                    <SurahPreview
                      display={SurahPreviewDisplay.Block}
                      chapterId={Number(chapterId)}
                      surahNumber={Number(chapterId)}
                      translatedSurahName={surah.translatedName as string}
                      surahName={surah.transliteratedName}
                      description={`${t('common:ayah')} ${localizedVerseNumber}`}
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
