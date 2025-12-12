/* eslint-disable max-lines */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ChapterCard from './ChapterCard';
import NewCard from './NewCard';
import NoGoalOrStreakCard from './NoGoalOrStreakCard';
import styles from './ReadingSection.module.scss';
import StreakOrGoalCard from './StreakOrGoalCard';

import Link, { LinkVariant } from '@/dls/Link/Link';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import BookmarkRemoveIcon from '@/icons/bookmark_remove.svg';
import { selectUserState } from '@/redux/slices/session';
import { logButtonClick } from '@/utils/eventLogger';
import { getProfileNavigationUrl } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';

interface Props {}

const ReadingSection: React.FC<Props> = () => {
  const { t } = useTranslation('home');
  const { isFirstTimeGuest, isGuest } = useSelector(selectUserState);
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys(false);
  const hasReadingSessions = recentlyReadVerseKeys?.length > 0;
  const lastReadVerse = recentlyReadVerseKeys?.[0];
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

  const continueReadingCard = (
    <ChapterCard
      surahNumber={lastReadVerse?.surah ? Number(lastReadVerse?.surah) : 1}
      verseNumber={lastReadVerse?.ayah ? Number(lastReadVerse?.ayah) : undefined}
      isContinueReading
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
