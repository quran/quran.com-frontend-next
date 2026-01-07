import { useContext } from 'react';

import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './RecentContent.module.scss';
import VerseMetadata from './VerseMetadata';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import DataContext from '@/contexts/DataContext';
import IconContainer from '@/dls/IconContainer/IconContainer';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedDate } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { TestId } from '@/tests/test-ids';

const RecentContent = () => {
  const { lang } = useTranslation();
  const { t } = useTranslation('my-quran');
  const chaptersData = useContext(DataContext);
  const { recentlyReadVerseKeys, timestamps } = useGetRecentlyReadVerseKeys(true, true);
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);

  const recentItems = recentlyReadVerseKeys
    .map((verseKey, index) => ({ verseKey, timestamp: timestamps?.[index] }))
    .filter(({ timestamp }) => timestamp && timestamp instanceof Date)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  const handleRecentContentClick = (verseKey: string) => {
    logButtonClick('my_quran_recent_content_item', { verseKey });
  };

  if (recentItems.length === 0) {
    return (
      <div className={styles.recentContentContainer}>
        <p className={styles.emptyState} data-testid={TestId.MY_QURAN_RECENT_CONTENT_EMPTY_STATE}>
          {t('recent-empty')}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.recentContentContainer}>
      {recentItems.map(({ verseKey, timestamp }) => {
        const [chapterId] = getVerseAndChapterNumbersFromKey(verseKey);
        const surah = getChapterData(chaptersData, chapterId);
        const verseUrl = getChapterWithStartingVerseUrl(verseKey);

        return (
          <Link
            key={verseKey}
            href={verseUrl}
            onClick={() => handleRecentContentClick(verseKey)}
            className={styles.recentContentItem}
            data-testid={TestId.MY_QURAN_RECENT_CONTENT_ITEM}
            aria-label={t('recent-read-verse', { verseKey })}
          >
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
              <VerseMetadata verseKey={verseKey} mushafId={mushafId} />
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default RecentContent;
