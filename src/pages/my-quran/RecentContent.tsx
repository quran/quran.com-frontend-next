import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './RecentContent.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import DataContext from '@/contexts/DataContext';
import IconContainer from '@/dls/IconContainer/IconContainer';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedDate } from '@/utils/locale';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

const RecentContent = () => {
  const { lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const { recentlyReadVerseKeys, timestamps } = useGetRecentlyReadVerseKeys(true, true);

  // Combine verse keys with timestamps, filter valid dates, reverse for newest first, and limit to 10
  const recentItems = recentlyReadVerseKeys
    .map((verseKey, index) => ({ verseKey, timestamp: timestamps?.[index] }))
    .filter(({ timestamp }) => timestamp instanceof Date)
    .reverse()
    .slice(0, 10);

  return (
    <div className={styles.recentContentContainer}>
      {recentItems.map(({ verseKey, timestamp }) => {
        const [chapterId] = getVerseAndChapterNumbersFromKey(verseKey);
        const surah = getChapterData(chaptersData, chapterId);
        return (
          <div key={verseKey} className={styles.recentContentItem}>
            <ChapterIconContainer
              chapterId={chapterId.toString()}
              hasSurahPrefix={false}
              size={ChapterIconsSize.Large}
            />
            <div className={styles.recentContentItemTitle}>
              <p>{surah.transliteratedName}</p>
              <IconContainer icon={<ChevronRightIcon />} />
            </div>
            <div className={styles.recentContentItemDescription}>
              <p>
                {timestamp &&
                  toLocalizedDate(timestamp, lang, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentContent;
