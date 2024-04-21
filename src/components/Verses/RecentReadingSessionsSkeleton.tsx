import { useContext, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './RecentReadingSessions.module.scss';
import skeletonStyles from './RecentReadingSessionsSkeleton.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import DataContext from '@/contexts/DataContext';
import Skeleton from '@/dls/Skeleton/Skeleton';
import surahPreviewStyles from '@/dls/SurahPreview/SurahPreviewBlock.module.scss';
import { getChapterData } from '@/utils/chapter';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

const VERSE_KEY = '19:1';
const RECENT_READING_SESSIONS_COUNT = 10;
const recentReadingSessionsArr = Array(RECENT_READING_SESSIONS_COUNT).fill(null);

const RecentReadingSessionsSkeleton = () => {
  const { t, lang } = useTranslation('home');
  const chaptersData = useContext(DataContext);

  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(VERSE_KEY);
  const surah = getChapterData(chaptersData, chapterId);
  const isMinimalLayout = shouldUseMinimalLayout(lang);
  const localizedSurahNumber = useMemo(() => {
    return toLocalizedNumber(Number(chapterId), lang);
  }, [lang, chapterId]);

  return (
    <>
      {recentReadingSessionsArr.map((k, i) => (
        <div
          className={classNames(styles.verseLink, skeletonStyles.skeletonItem)}
          // eslint-disable-next-line react/no-array-index-key
          key={`skeleton_${i}`}
        >
          <div className={surahPreviewStyles.container}>
            <div className={surahPreviewStyles.header}>
              <div>
                <Skeleton isActive>
                  <div className={surahPreviewStyles.translatedSurahName}>
                    {isMinimalLayout && <>{t('common:surah')} </>}
                    {surah.translatedName as string}
                  </div>
                </Skeleton>
                {!isMinimalLayout && (
                  <Skeleton isActive>
                    <div className={surahPreviewStyles.surahName}>
                      {t('common:surah')} <br />
                      {surah.transliteratedName}
                    </div>
                  </Skeleton>
                )}
              </div>
              <div className={surahPreviewStyles.surahNumber}>
                <Skeleton isActive>{localizedSurahNumber}</Skeleton>
              </div>
            </div>
            <Skeleton isActive>
              <div className={surahPreviewStyles.surahIcon}>
                <ChapterIconContainer
                  chapterId={chapterId.toString()}
                  hasSurahPrefix={false}
                  size={ChapterIconsSize.Large}
                />
                <div className={surahPreviewStyles.description}>{`${t(
                  'common:ayah',
                )} ${toLocalizedNumber(Number(verseNumber), lang)}`}</div>
              </div>
            </Skeleton>
          </div>
        </div>
      ))}
    </>
  );
};

export default RecentReadingSessionsSkeleton;
