/* eslint-disable max-lines */
import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

import ChapterCard from './ChapterCard';
import NewCard from './NewCard';
import NoGoalOrStreakCard from './NoGoalOrStreakCard';
import styles from './ReadingSection.module.scss';
import StreakOrGoalCard from './StreakOrGoalCard';

import { getPageVerses } from '@/api';
import Link, { LinkVariant } from '@/dls/Link/Link';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import BookmarkRemoveIcon from '@/icons/bookmark_remove.svg';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectUserState } from '@/redux/slices/session';
import { getMushafId } from '@/utils/api';
import { getUserPreferences } from '@/utils/auth/api';
import { makeUserPreferencesUrl } from '@/utils/auth/apiPaths';
import { getPageNumberFromBookmark, parseReadingBookmark } from '@/utils/bookmark';
import { logButtonClick } from '@/utils/eventLogger';
import { getProfileNavigationUrl } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';

interface Props {}

const ReadingSection: React.FC<Props> = () => {
  const { t, lang } = useTranslation('home');
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

  // Extract page number from bookmark if it's a page bookmark
  // Supports both logged-in user bookmarks and guest bookmarks
  const pageNumberFromBookmark = useMemo(() => {
    const bookmark = isGuest ? guestReadingBookmark : userPreferences?.readingBookmark?.bookmark;
    return getPageNumberFromBookmark(bookmark);
  }, [guestReadingBookmark, userPreferences, isGuest]);

  // Fetch verses for the page if bookmark is a page bookmark
  const { data: pageVersesData } = useSWR(
    pageNumberFromBookmark ? `page-verses-${pageNumberFromBookmark}` : null,
    async () => {
      if (!pageNumberFromBookmark) return null;
      return getPageVerses(String(pageNumberFromBookmark), lang, { mushaf: mushafId });
    },
  );

  // Parse reading bookmark to extract surah and verse numbers
  // Falls back to recently read verses if reading bookmark is not available
  // Supports both logged-in user bookmarks and guest bookmarks
  const { surahNumber, verseNumber, pageNumber } = useMemo(() => {
    const readingBookmark = isGuest
      ? guestReadingBookmark
      : userPreferences?.readingBookmark?.bookmark;

    return parseReadingBookmark(readingBookmark, pageVersesData, recentlyReadVerseKeys);
  }, [guestReadingBookmark, userPreferences, pageVersesData, recentlyReadVerseKeys, isGuest]);

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
        <Link
          variant={LinkVariant.Blend}
          href={getProfileNavigationUrl()}
          onClick={onMyQuranClicked}
        >
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
      <StreakOrGoalCard currentActivityDay={currentActivityDay} goal={goal} streak={streak} />
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
            <div className={styles.cardContainer}>{goalsOrStreakCard}</div>
            <div className={styles.cardContainer}>{continueReadingCard}</div>
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
