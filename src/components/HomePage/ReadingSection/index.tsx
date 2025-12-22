/* eslint-disable max-lines */
import React, { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

import ChapterCard from './ChapterCard';
import NewCard from './NewCard';
import NoGoalOrStreakCard from './NoGoalOrStreakCard';
import styles from './ReadingSection.module.scss';
import StreakOrGoalCard from './StreakOrGoalCard';

import Card from '@/components/HomePage/Card';
import Link, { LinkVariant } from '@/dls/Link/Link';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import BookmarkRemoveIcon from '@/icons/bookmark_remove.svg';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectUserState } from '@/redux/slices/session';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
import { getUserPreferences } from '@/utils/auth/api';
import { makeUserPreferencesUrl } from '@/utils/auth/apiPaths';
import { parseReadingBookmark, parsePageReadingBookmark } from '@/utils/bookmark';
import { logButtonClick } from '@/utils/eventLogger';
import { MY_QURAN_URL } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';
import { getPageFirstVerseKey, getVersePageNumber } from '@/utils/verse';

interface Props {}

const ReadingSection: React.FC<Props> = () => {
  const { t } = useTranslation('home');
  const { isFirstTimeGuest, isGuest } = useSelector(selectUserState);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  // Fetch user preferences for reading bookmark (logged-in users)
  const { data: userPreferences } = useSWR(
    !isGuest ? makeUserPreferencesUrl() : null,
    getUserPreferences,
  );

  // Fetch recently read verses as fallback (for all users)
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys(false);

  const readingBookmark = isGuest
    ? guestReadingBookmark
    : userPreferences?.readingBookmark?.bookmark;

  const parsed = useMemo(() => {
    return parseReadingBookmark(readingBookmark, recentlyReadVerseKeys);
  }, [readingBookmark, recentlyReadVerseKeys]);

  const storedPageNumberFromBookmark = useMemo(
    () => parsePageReadingBookmark(readingBookmark)?.pageNumber,
    [readingBookmark],
  );

  const { data: firstVerseOfStoredPage } = useSWR(
    !parsed.surahNumber && storedPageNumberFromBookmark
      ? `first-verse-${storedPageNumberFromBookmark}-${mushafId}`
      : null,
    async () => {
      if (!storedPageNumberFromBookmark) return null;
      return getPageFirstVerseKey(storedPageNumberFromBookmark, mushafId);
    },
  );

  const effectiveSurahNumber = parsed.surahNumber ?? firstVerseOfStoredPage?.surahNumber ?? 1;
  const effectiveVerseNumber =
    typeof parsed.verseNumber === 'number'
      ? parsed.verseNumber
      : firstVerseOfStoredPage?.verseNumber;

  const { data: resolvedPageNumber } = useSWR(
    effectiveVerseNumber
      ? `verse-to-page-${effectiveSurahNumber}-${effectiveVerseNumber}-${mushafId}`
      : null,
    async () => {
      if (!effectiveVerseNumber) return null;
      return getVersePageNumber(
        { surahNumber: effectiveSurahNumber, verseNumber: effectiveVerseNumber },
        mushafId,
      );
    },
  );

  // Derive effective surah/verse from bookmark or first verse of stored page
  // Resolve the page for the current mushaf using the effective surah/verse
  // Applies to both guest and logged-in users
  const surahNumber = effectiveSurahNumber;
  const verseNumber = effectiveVerseNumber ?? null;
  const isPageBookmark =
    typeof readingBookmark === 'string' && readingBookmark.startsWith(BookmarkType.Page);

  const pageNumber = isPageBookmark
    ? resolvedPageNumber ?? storedPageNumberFromBookmark ?? undefined
    : undefined;

  // Determine if user has reading sessions (either reading bookmark or recently read verses)
  const hasReadingBookmark = isGuest
    ? !!guestReadingBookmark
    : !!userPreferences?.readingBookmark?.bookmark;
  const hasRecentlyReadVerses = recentlyReadVerseKeys && recentlyReadVerseKeys.length > 0;
  const hasReadingSessions = hasReadingBookmark || hasRecentlyReadVerses;

  const isGuestWithReadingSessions = isGuest && hasReadingSessions;
  const isUserWithReadingSessions = !isGuest && hasReadingSessions;

  const { goal, streak, currentActivityDay } = useGetStreakWithMetadata({
    showDayName: true,
  });

  const onMyQuranClicked = () => {
    logButtonClick('homepage_my_quran');
  };

  let headerText = '';
  if (isGuestWithReadingSessions || isUserWithReadingSessions) {
    headerText = t('continue-read');
  } else if (isFirstTimeGuest || !isUserWithReadingSessions) {
    headerText = t('start-read');
  }

  const header = (
    <div className={styles.header}>
      <h1>{headerText}</h1>
      <div className={styles.cardWithIcon}>
        <div className={styles.myQuranContainer}>
          <BookmarkRemoveIcon />
        </div>
        <Link variant={LinkVariant.Blend} href={MY_QURAN_URL} onClick={onMyQuranClicked}>
          <p className={styles.myQuranText}>{t('my-quran')}</p>
        </Link>
      </div>
    </div>
  );

  const safeSurahNumber = surahNumber ?? 1;
  const safeVerseNumber = typeof verseNumber === 'number' ? verseNumber : undefined;

  const continueReadingCard = (
    <ChapterCard
      surahNumber={safeSurahNumber}
      verseNumber={safeVerseNumber}
      isContinueReading
      pageNumber={pageNumber}
    />
  );

  const goalsOrStreakCard =
    streak || goal ? (
      <Card className={styles.streakCard}>
        <div className={styles.cardOuterContainer}>
          <div className={classNames(styles.streakCardLeft, styles.cardWithIcon)}>
            <StreakOrGoalCard currentActivityDay={currentActivityDay} goal={goal} streak={streak} />
          </div>
        </div>
      </Card>
    ) : (
      <>{!isMobile() && <NoGoalOrStreakCard />}</>
    );

  const newCard = <NewCard />;

  if (isGuestWithReadingSessions) {
    return (
      <>
        {header}
        <div className={styles.cardsContainer}>
          <div className={styles.cardContainer}>{continueReadingCard}</div>
          <div className={styles.cardContainer}>
            {goalsOrStreakCard}
            {newCard}
          </div>
        </div>
      </>
    );
  }

  if (isFirstTimeGuest || !isUserWithReadingSessions) {
    return (
      <>
        {header}
        <div className={styles.cardsContainer}>
          <div className={styles.cardContainer}>
            <ChapterCard surahNumber={1} />
          </div>
          <div className={styles.cardContainer}>
            {newCard}
            {goalsOrStreakCard}
          </div>
        </div>
      </>
    );
  }

  if (!isGuest) {
    if (isMobile()) {
      return (
        <>
          {header}
          <div className={styles.cardsContainer}>
            <div className={styles.cardContainer}>{continueReadingCard}</div>
            <div className={styles.cardContainer}>{goalsOrStreakCard}</div>
            <div className={styles.cardContainer}>{newCard}</div>
          </div>
        </>
      );
    }
    return (
      <>
        {header}
        <div className={styles.cardsContainer}>
          <div className={styles.cardContainer}>{continueReadingCard}</div>
          <div className={styles.cardContainer}>
            {goalsOrStreakCard}
            {newCard}
          </div>
        </div>
      </>
    );
  }

  if (isFirstTimeGuest) {
    return (
      <>
        {header}
        <div className={styles.cardsContainer}>
          <div className={styles.cardContainer}>
            <ChapterCard surahNumber={1} />
          </div>
          <div className={styles.cardContainer}>
            {newCard}
            {goalsOrStreakCard}
          </div>
        </div>
      </>
    );
  }

  return <></>;
};

export default ReadingSection;
