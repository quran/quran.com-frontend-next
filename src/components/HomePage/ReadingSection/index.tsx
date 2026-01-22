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
import useGlobalReadingBookmark from '@/hooks/auth/useGlobalReadingBookmark';
import useMappedBookmark from '@/hooks/useMappedBookmark';
import BookmarkRemoveIcon from '@/icons/bookmark_remove.svg';
import { selectGuestReadingBookmark } from '@/redux/slices/guestBookmark';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectUserState } from '@/redux/slices/session';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
import { GuestReadingBookmark } from '@/utils/bookmark';
import { logButtonClick } from '@/utils/eventLogger';
import { MY_QURAN_URL } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';
import { getPageFirstVerseKey } from '@/utils/verse';

interface Props {}

const ReadingSection: React.FC<Props> = () => {
  const { t } = useTranslation('home');
  const { isFirstTimeGuest, isGuest } = useSelector(selectUserState);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const guestReadingBookmark = useSelector(selectGuestReadingBookmark);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  // Use global reading bookmark hook (singleton pattern)
  const { readingBookmark: readingBookmarkData } = useGlobalReadingBookmark(mushafId);

  // Fetch recently read verses as fallback (for all users)
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys(false);

  // Get effective bookmark data from guest or logged-in state
  const effectiveBookmark: GuestReadingBookmark | null = useMemo(() => {
    if (isGuest) {
      return guestReadingBookmark;
    }
    if (!readingBookmarkData) return null;
    return {
      key: readingBookmarkData.key,
      type: readingBookmarkData.type,
      verseNumber: readingBookmarkData.verseNumber,
      mushafId,
    };
  }, [isGuest, guestReadingBookmark, readingBookmarkData, mushafId]);

  // Use the reusable mapping hook for cross-mushaf bookmark handling
  const {
    needsMapping: needsCrossMushafMapping,
    effectivePageNumber,
    effectiveAyahVerseKey,
    mappedPageData,
    bookmarkMushafId,
  } = useMappedBookmark({
    bookmark: effectiveBookmark,
    currentMushafId: mushafId,
    swrKeyPrefix: 'map-bookmark-home',
  });

  const isPageBookmark = effectiveBookmark?.type === BookmarkType.Page;

  // Get page number from page bookmark
  const storedPageNumber = isPageBookmark ? effectiveBookmark?.key : undefined;

  // For page bookmarks, fetch first verse of that page (using stored mushafId for guests)
  const needsPageMapping = isPageBookmark && storedPageNumber && needsCrossMushafMapping;
  const isMappingReady = !needsPageMapping || !!mappedPageData;

  const { data: firstVerseOfStoredPage } = useSWR(
    storedPageNumber && isMappingReady
      ? `first-verse-${storedPageNumber}-${bookmarkMushafId}`
      : null,
    async () => {
      // Optimization: use mapped data if available
      if (mappedPageData?.firstVerseKey) {
        const [surah, verse] = mappedPageData.firstVerseKey.split(':');
        return { surahNumber: Number(surah), verseNumber: Number(verse) };
      }
      if (!storedPageNumber) return null;
      return getPageFirstVerseKey(storedPageNumber, bookmarkMushafId);
    },
  );

  // Derive effective surah/verse (use mapped values if available)
  const effectiveSurahNumber =
    effectiveAyahVerseKey?.surahNumber ??
    firstVerseOfStoredPage?.surahNumber ??
    recentlyReadVerseKeys?.[0]?.surah ??
    1;
  const effectiveVerseNumber =
    effectiveAyahVerseKey?.verseNumber ??
    firstVerseOfStoredPage?.verseNumber ??
    recentlyReadVerseKeys?.[0]?.ayah;

  // Resolve page number for current mushaf (use effectivePageNumber from hook)
  const resolvedPageNumber = isPageBookmark ? effectivePageNumber ?? undefined : undefined;

  const surahNumber = Number(effectiveSurahNumber);
  const verseNumber = effectiveVerseNumber ? Number(effectiveVerseNumber) : null;
  const pageNumber = resolvedPageNumber;

  // Determine if user has reading sessions
  const hasReadingBookmark = !!effectiveBookmark;
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
