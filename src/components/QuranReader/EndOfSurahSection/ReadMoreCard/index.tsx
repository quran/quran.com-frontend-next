import React, { useContext, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ChapterLink from './ChapterLink';
import styles from './ReadMoreCard.module.scss';

import Card from '@/components/HomePage/Card';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import ReplayIcon from '@/icons/replay.svg';
import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import { pickRandom } from '@/utils/array';
import { getChapterData, getNextChapterNumber, getPreviousChapterNumber } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { shouldUseMinimalLayout } from '@/utils/locale';
import { getSurahNavigationUrl } from '@/utils/navigation';
import { ChapterContent } from 'types/ApiResponses';

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
  const { t, lang } = useTranslation('quran-reader');
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
        <span className={styles.title}>{t('end-of-surah.read-more')}</span>
        <Button
          onClick={handleScrollToTop}
          className={styles.replayButton}
          prefix={<ReplayIcon />}
          variant={ButtonVariant.Ghost}
          aria-label={t('end-of-surah.beginning-of-surah')}
        >
          {t('end-of-surah.beginning-of-surah')}
        </Button>
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
            badgeLabel={t('next')}
            ariaLabel={t('end-of-surah.next-surah-aria-label', {
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
            badgeLabel={t('prev')}
            ariaLabel={t('end-of-surah.previous-surah-aria-label', {
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
