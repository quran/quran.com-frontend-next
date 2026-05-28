import React from 'react';

import classNames from 'classnames';

import styles from './ReadMoreCard.module.scss';

import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';
import { getWordCount } from '@/utils/string';
import { ChapterContent } from 'types/ApiResponses';
import Chapter from 'types/Chapter';

const MIN_SUMMARY_WORDS = 3;
const LONG_SUMMARY_THRESHOLD = 7;

interface ChapterLinkProps {
  chapter: Chapter;
  chapterNumber: number;
  navigationUrl: string;
  summary: ChapterContent | null;
  isNext: boolean;
  shouldShowArabicName: boolean;
  badgeLabel: string;
  ariaLabel: string;
  onScrollToTop: () => void;
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
  onScrollToTop,
}) => {
  const badgeStyle = isNext ? styles.nextBadge : styles.prevBadge;
  const chapterTitle = `${chapterNumber}. ${chapter.transliteratedName}`;
  const chapterSubtitle = shouldShowArabicName ? chapter.nameArabic : chapter.translatedName;

  const summaryText = summary?.text;
  const wordCount = summaryText ? getWordCount(summaryText) : 0;
  const hasSummary = wordCount > MIN_SUMMARY_WORDS;
  const isLongSummary = hasSummary && wordCount > LONG_SUMMARY_THRESHOLD;

  const handleClick = (event: React.MouseEvent) => {
    const eventName = isNext ? 'end_of_surah_next_chapter' : 'end_of_surah_previous_chapter';
    logButtonClick(eventName, { chapterNumber });
    // Skip the scroll reset for modified/non-primary clicks (e.g. Cmd/Ctrl/Shift-click
    // to open in a new tab), since the current tab isn't navigating away and should
    // keep its reading position.
    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (isModifiedClick) {
      return;
    }
    // Reset scroll so the newly opened surah starts from the top instead of
    // staying at the bottom where the end-of-surah card was clicked.
    onScrollToTop();
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
            aria-hidden="true"
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
