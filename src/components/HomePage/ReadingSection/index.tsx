/* eslint-disable max-lines */
import React from 'react';

import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import ChapterCard from './ChapterCard';
import NoGoalOrStreakCard from './NoGoalOrStreakCard';
import styles from './ReadingSection.module.scss';
import StreakOrGoalCard from './StreakOrGoalCard';

import Card from '@/components/HomePage/Card';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import BookmarkRemoveIcon from '@/icons/bookmark_remove.svg';
import SunIcon from '@/icons/sun.svg';
import ArrowIcon from '@/public/icons/arrow.svg';
import { selectUserState } from '@/redux/slices/session';
import { logButtonClick } from '@/utils/eventLogger';
import { getFirstTimeReadingGuideNavigationUrl, getProfileNavigationUrl } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';
import { getVerseNumberFromKey } from '@/utils/verse';

interface Props {}

const ReadingSection: React.FC<Props> = () => {
  const { t } = useTranslation('home');
  const { isFirstTimeGuest, isGuest, hasReadingSessions, lastReadVerse } =
    useSelector(selectUserState);
  const isGuestWithReadingSessions = isGuest && hasReadingSessions;
  const isUserWithReadingSessions = !isGuest && hasReadingSessions;
  const { goal, streak, currentActivityDay } = useGetStreakWithMetadata({
    showDayName: true,
  });

  const onMyQuranClicked = () => {
    logButtonClick('homepage_my_quran');
  };

  const onFirstTimeReadingGuideClicked = () => {
    logButtonClick('homepage_first_time_reading_guide');
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
        <BookmarkRemoveIcon />
        <Link
          variant={LinkVariant.Blend}
          href={getProfileNavigationUrl()}
          onClick={onMyQuranClicked}
        >
          {t('my-quran')}
        </Link>
      </div>
    </div>
  );

  const continueReadingCard = (
    <ChapterCard
      surahNumber={lastReadVerse.chapterId ? Number(lastReadVerse.chapterId) : 1}
      verseNumber={
        lastReadVerse.verseKey ? getVerseNumberFromKey(lastReadVerse.verseKey) : undefined
      }
      isContinueReading
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

  const newCard = (
    <Card
      className={styles.firstTimeReadingCard}
      link={getFirstTimeReadingGuideNavigationUrl()}
      isNewTab
      onClick={onFirstTimeReadingGuideClicked}
    >
      <div className={styles.cardOuterContainer}>
        <div className={styles.cardWithIcon}>
          <SunIcon />
          <div className={styles.link}>
            <Trans
              i18nKey={
                isGuestWithReadingSessions || isUserWithReadingSessions
                  ? 'home:know-someone'
                  : 'home:first-time-reading'
              }
              components={{
                link: (
                  <Link
                    isNewTab
                    variant={LinkVariant.Blend}
                    href={getFirstTimeReadingGuideNavigationUrl()}
                    className={styles.linkHref}
                  />
                ),
              }}
            />
          </div>
        </div>
        <IconContainer
          className={styles.arrowIcon}
          size={IconSize.Xsmall}
          icon={<ArrowIcon />}
          shouldForceSetColors={false}
        />
      </div>
    </Card>
  );

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
