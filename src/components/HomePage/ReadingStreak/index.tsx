/* eslint-disable max-lines */
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CurrentWeekProgress from './CurrentWeekProgress';
import LoggedOutReadingStreak from './LoggedOutReadingStreak';
import styles from './ReadingStreak.module.scss';
import StreakDefinitionModal from './StreakDefinitionModal';

import ReadingGoalAmount from '@/components/ReadingGoal/ReadingGoalAmount';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import {
  getChapterWithStartingVerseUrl,
  getReadingGoalNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';
import { convertFractionToPercent } from '@/utils/number';

export enum ReadingStreakLayout {
  Home = 'home',
  QuranReader = 'quran-reader',
}

interface ReadingStreakProps {
  layout?: ReadingStreakLayout;
}

const ReadingStreak: React.FC<ReadingStreakProps> = ({ layout = ReadingStreakLayout.Home }) => {
  const { t, lang } = useTranslation('reading-goal');
  const isQuranReader = layout === ReadingStreakLayout.QuranReader;

  const { isLoading, error, streak, readingGoal, weekData, currentReadingDay } =
    useGetStreakWithMetadata();
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys();

  const nextVerseToRead = readingGoal?.progress?.nextVerseToRead ?? recentlyReadVerseKeys[0];
  const localizedStreak = toLocalizedNumber(streak, lang);
  const percent = convertFractionToPercent(currentReadingDay?.progress || 0);
  const localizedPercent = toLocalizedNumber(percent, lang);
  const isGoalDone = percent >= 100;
  const hasUserReadToday = (isQuranReader && !isGoalDone) || currentReadingDay?.hasRead;

  const streakUI = (
    <div
      className={classNames(
        styles.streakTitle,
        !hasUserReadToday && streak > 0 && styles.streakTitleWarning,
      )}
    >
      {t('x-days-streak', { days: localizedStreak })}
      <StreakDefinitionModal />
    </div>
  );

  const getGoalStatus = () => {
    if (!readingGoal) return null;

    if (readingGoal.isCompleted) {
      return t('progress.goal-complete');
    }

    if (percent < 100) {
      return (
        <ReadingGoalAmount
          currentReadingDay={currentReadingDay}
          readingGoal={readingGoal}
          context={isQuranReader ? 'quran_reader' : 'home_page'}
        />
      );
    }

    return t('progress.complete');
  };

  const onContinueReadingClick = () => {
    logButtonClick('homepage_streak_widget_continue_reading', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      verse_key: nextVerseToRead,
    });
  };

  const onViewProgressClick = () => {
    logButtonClick('homepage_streak_widget_view_progress');
  };

  if (error || !isLoggedIn()) {
    return <LoggedOutReadingStreak />;
  }

  const getContent = () => {
    if (!isQuranReader) {
      return (
        <>
          <div>
            <span className={styles.streakSubtitle}>{t('reading-goal-label')}</span>
            {isLoading ? <Skeleton>{streakUI}</Skeleton> : streakUI}
          </div>
          <CurrentWeekProgress readingGoal={readingGoal} weekData={weekData} />
        </>
      );
    }

    if (!isGoalDone && !readingGoal.isCompleted) {
      return (
        <div className={styles.dailyProgressContainer}>
          <p className={styles.streakTitle}>{t('daily-progress')}</p>
          <p className={styles.dailyGoal}>
            <ReadingGoalAmount
              currentReadingDay={currentReadingDay}
              readingGoal={readingGoal}
              context={isQuranReader ? 'quran_reader' : 'home_page'}
            />
          </p>
          <div className={styles.progressContainer}>
            <Progress value={percent} />
            <div className={styles.progressTextContainer}>
              <p>{localizedPercent}%</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className={styles.dailyProgressContainer}>
          <p className={styles.streakTitle}>{t('goal-done.title')}</p>
          <p className={styles.dailyGoal}>{t('goal-done.description')}</p>
        </div>
        <CurrentWeekProgress readingGoal={readingGoal} weekData={weekData} />
      </>
    );
  };

  // if this is QuranReader, don't render anything if there is no reading goal
  if (isQuranReader && !readingGoal) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>

      <div className={styles.container}>{getContent()}</div>

      {!isQuranReader && (
        <div className={styles.goalContainer}>
          {readingGoal ? (
            getGoalStatus()
          ) : (
            <Button href={getReadingGoalNavigationUrl()}>{t('create-reading-goal')}</Button>
          )}
        </div>
      )}

      {/* Render these buttons only if this is not in the QuranReader && there is a reading goal  */}
      {!isQuranReader && readingGoal ? (
        <div className={styles.actionsContainer}>
          <Button
            href={nextVerseToRead ? getChapterWithStartingVerseUrl(nextVerseToRead) : undefined}
            isDisabled={!nextVerseToRead}
            onClick={onContinueReadingClick}
          >
            {t('continue-reading')}
          </Button>
          <Button
            variant={ButtonVariant.Ghost}
            href={getReadingGoalProgressNavigationUrl()}
            onClick={onViewProgressClick}
          >
            {t('view-progress')}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ReadingStreak;
