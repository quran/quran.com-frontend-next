import React from 'react';

import classNames from 'classnames';
import { ChapterSummary } from 'types/ApiResponses';
import Chapter from 'types/Chapter';

import styles from './ReadMoreCard.module.scss';

import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';
import { getWordCount } from '@/utils/string';

const MIN_SUMMARY_WORDS = 3;
const LONG_SUMMARY_THRESHOLD = 7;

interface ChapterLinkProps {
  chapter: Chapter;
  chapterNumber: number;
  navigationUrl: string;
  summary: ChapterSummary | null;
  isNext: boolean;
  shouldShowArabicName: boolean;
  badgeLabel: string;
  ariaLabel: string;
}

const ChapterLink: React.FC<ChapterLinkProps> = ({
  chapter,
  chapterNumber,
  navigationUrl,
  summary,
  isNext,
  shouldShowArabicName,
  badgeLabel,
  ariaLabel,
}) => {
  const badgeStyle = isNext ? styles.nextBadge : styles.prevBadge;
  const chapterTitle = `${chapterNumber}. ${chapter.transliteratedName}`;
  const chapterSubtitle = shouldShowArabicName ? chapter.nameArabic : chapter.translatedName;

  const summaryText = summary?.text;
  const wordCount = summaryText ? getWordCount(summaryText) : 0;
  const hasSummary = wordCount > MIN_SUMMARY_WORDS;
  const isLongSummary = hasSummary && wordCount > LONG_SUMMARY_THRESHOLD;

  const handleClick = () => {
    const eventName = isNext ? 'end_of_surah_next_chapter' : 'end_of_surah_previous_chapter';
    logButtonClick(eventName, { chapterNumber });
  };

  return (
    <div className={styles.surahRow}>
      <div className={styles.surahHeader}>
        <div className={styles.surahInfo}>
          <Link
            href={navigationUrl}
            className={styles.surahTitle}
            onClick={handleClick}
            aria-label={ariaLabel}
          >
            {chapterTitle}
          </Link>
          <span className={styles.surahSubtitle}>{chapterSubtitle}</span>
        </div>
        <div className={styles.badgeContainer}>
          <Link
            href={navigationUrl}
            className={classNames(styles.badge, badgeStyle)}
            onClick={handleClick}
            aria-label={ariaLabel}
          >
            {badgeLabel}
          </Link>
        </div>
      </div>

      {hasSummary && (
        <div className={classNames(styles.summary, { [styles.longText]: isLongSummary })}>
          {summaryText}
        </div>
      )}
    </div>
  );
};

export default ChapterLink;
