import React, { useContext, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import { ChapterContent } from 'types/ApiResponses';

import ChapterLink from './ChapterLink';
import styles from './ReadMoreCard.module.scss';

import Card from '@/components/HomePage/Card';
import DataContext from '@/contexts/DataContext';
import ReplayIcon from '@/icons/replay.svg';
import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import { pickRandom } from '@/utils/array';
import { getChapterData, getNextChapterNumber, getPreviousChapterNumber } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { shouldUseMinimalLayout } from '@/utils/locale';
import { getSurahNavigationUrl } from '@/utils/navigation';

interface ReadMoreCardProps {
  cardClassName?: string;
  chapterNumber: number;
  nextSummaries?: ChapterContent[];
  previousSummaries?: ChapterContent[];
  onScrollToTop: () => void;
}

const ReadMoreCard: React.FC<ReadMoreCardProps> = ({
  cardClassName,
  chapterNumber,
  nextSummaries,
  previousSummaries,
  onScrollToTop,
}) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const isReadingByRevelationOrder = useSelector(selectIsReadingByRevelationOrder);

  const shouldShowArabicName = shouldUseMinimalLayout(lang);

  const nextChapterNumber = useMemo(
    () => getNextChapterNumber(chapterNumber, isReadingByRevelationOrder),
    [chapterNumber, isReadingByRevelationOrder],
  );

  const prevChapterNumber = useMemo(
    () => getPreviousChapterNumber(chapterNumber, isReadingByRevelationOrder),
    [chapterNumber, isReadingByRevelationOrder],
  );

  const nextChapter = nextChapterNumber
    ? getChapterData(chaptersData, String(nextChapterNumber))
    : null;
  const prevChapter = prevChapterNumber
    ? getChapterData(chaptersData, String(prevChapterNumber))
    : null;

  const nextSummary = useMemo(() => pickRandom(nextSummaries), [nextSummaries]);
  const prevSummary = useMemo(() => pickRandom(previousSummaries), [previousSummaries]);

  const canShowNext = Boolean(nextChapterNumber && nextChapter);
  const canShowPrev = Boolean(prevChapterNumber && prevChapter);

  const handleScrollToTop = () => {
    logButtonClick('end_of_surah_scroll_to_beginning');
    onScrollToTop();
  };

  return (
    <Card className={classNames(styles.endOfSurahCard, cardClassName)} data-testid="read-more-card">
      <div className={styles.header}>
        <span className={styles.title}>{t('quran-reader:end-of-surah.read-more')}</span>
        <button
          onClick={handleScrollToTop}
          className={styles.replayButton}
          aria-label={t('quran-reader:end-of-surah.beginning-of-surah')}
          type="button"
        >
          <span className={styles.replayButtonContent}>
            <ReplayIcon />
            <span>{t('quran-reader:end-of-surah.beginning-of-surah')}</span>
          </span>
        </button>
      </div>

      <div className={styles.content}>
        {canShowNext && (
          <ChapterLink
            chapter={nextChapter}
            chapterNumber={nextChapterNumber}
            navigationUrl={getSurahNavigationUrl(nextChapterNumber as number)}
            summary={nextSummary}
            isNext
            shouldShowArabicName={shouldShowArabicName}
            badgeLabel={t('common:next')}
            ariaLabel={t('quran-reader:end-of-surah.next-surah-aria-label', {
              surahName: nextChapter.transliteratedName,
              surahNumber: nextChapterNumber,
            })}
          />
        )}

        {canShowPrev && (
          <ChapterLink
            chapter={prevChapter}
            chapterNumber={prevChapterNumber}
            navigationUrl={getSurahNavigationUrl(prevChapterNumber as number)}
            summary={prevSummary}
            isNext={false}
            shouldShowArabicName={shouldShowArabicName}
            badgeLabel={t('common:prev')}
            ariaLabel={t('quran-reader:end-of-surah.previous-surah-aria-label', {
              surahName: prevChapter.transliteratedName,
              surahNumber: prevChapterNumber,
            })}
          />
        )}
      </div>
    </Card>
  );
};

export default ReadMoreCard;
