/* eslint-disable max-lines */
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import CurrentWeekProgress from './CurrentWeekProgress';
import styles from './ReadingStreak.module.scss';
import StreakDefinitionModal from './StreakDefinitionModal';
import StreakIntroductionWidget from './StreakIntroductionWidget';

import ReadingGoalAmount from '@/components/ReadingGoal/ReadingGoalAmount';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import Progress from '@/dls/Progress';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useGetRecentlyReadVerseKeys from '@/hooks/auth/useGetRecentlyReadVerseKeys';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
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

  const { isLoading, error, streak, goal, weekData, currentActivityDay } = useGetStreakWithMetadata(
    {
      disableIfNoGoalExists: isQuranReader,
    },
  );
  const { recentlyReadVerseKeys } = useGetRecentlyReadVerseKeys();

  const nextVerseToRead = goal?.progress?.nextVerseToRead ?? recentlyReadVerseKeys[0];
  const localizedStreak = toLocalizedNumber(streak, lang);
  const percent = convertFractionToPercent(currentActivityDay?.progress || 0);
  const localizedPercent = toLocalizedNumber(percent, lang);
  const isGoalDone = percent >= 100;
  const hasUserReadToday = (isQuranReader && !isGoalDone) || currentActivityDay?.hasRead;

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
    if (!goal) return null;

    if (goal.isCompleted) {
      return t('progress.goal-complete');
    }

    if (percent < 100) {
      return (
        <ReadingGoalAmount
          currentActivityDay={currentActivityDay}
          goal={goal}
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

  if (!isQuranReader && (error || (!isLoading && streak === 0 && !goal))) {
    return <StreakIntroductionWidget />;
  }

  const getContent = () => {
    if (!isQuranReader) {
      return (
        <>
          <div>
            <span className={styles.streakSubtitle}>{t('reading-goal-label')}</span>
            {isLoading ? <Skeleton>{streakUI}</Skeleton> : streakUI}
          </div>
          <CurrentWeekProgress goal={goal} weekData={weekData} />
        </>
      );
    }

    if (!isGoalDone && !goal.isCompleted) {
      return (
        <div className={styles.dailyProgressContainer}>
          <p className={styles.streakTitle}>{t('daily-progress')}</p>
          <p className={styles.dailyGoal}>
            <ReadingGoalAmount
              currentActivityDay={currentActivityDay}
              goal={goal}
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
        <CurrentWeekProgress goal={goal} weekData={weekData} />
      </>
    );
  };

  // if this is QuranReader, don't render anything if there is no reading goal
  if (isQuranReader && (isLoading || !goal)) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Link href="/product-updates/quran-reading-streaks" className={styles.announcementPill}>
        {t('common:new')} {t('common:learn-more')}
      </Link>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>

      <div className={styles.container}>{getContent()}</div>

      {!isQuranReader && (
        <div className={styles.goalContainer}>
          {goal ? (
            getGoalStatus()
          ) : (
            <Button href={getReadingGoalNavigationUrl()}>{t('create-reading-goal')}</Button>
          )}
        </div>
      )}

      {/* Render these buttons only if this is not in the QuranReader && there is a reading goal  */}
      {!isQuranReader && goal ? (
        <div className={styles.actionsContainer}>
          <Button
            href={nextVerseToRead ? getChapterWithStartingVerseUrl(nextVerseToRead) : undefined}
            isDisabled={!nextVerseToRead}
            onClick={onContinueReadingClick}
          >
            {t(currentActivityDay?.ranges.length ? 'continue-reading' : 'start-reading')}
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
