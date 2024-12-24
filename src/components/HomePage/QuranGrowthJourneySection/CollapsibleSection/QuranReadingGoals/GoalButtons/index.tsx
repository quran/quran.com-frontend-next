import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './GoalButtons.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getChapterWithStartingVerseUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';

type Props = {
  nextVerseToRead: string;
  currentActivityDay: CurrentQuranActivityDay;
};

const GoalButtons: React.FC<Props> = ({ nextVerseToRead, currentActivityDay }) => {
  const { t } = useTranslation('reading-goal');
  const onViewProgressClick = (e) => {
    // don't toggle collapsible parent when clicking
    e.stopPropagation();
    logButtonClick('homepage_streak_widget_view_progress');
  };

  const onContinueReadingClick = (e) => {
    // don't toggle collapsible parent when clicking
    e.stopPropagation();
    logButtonClick('homepage_streak_widget_continue_reading', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      verse_key: nextVerseToRead,
    });
  };

  return (
    <div className={styles.actionsContainer}>
      <Button
        href={nextVerseToRead ? getChapterWithStartingVerseUrl(nextVerseToRead) : undefined}
        isDisabled={!nextVerseToRead}
        onClick={onContinueReadingClick}
        size={ButtonSize.Small}
        type={ButtonType.Success}
      >
        {t(currentActivityDay?.ranges.length ? 'continue-reading' : 'start-reading')}
      </Button>
      <Button
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        href={getReadingGoalProgressNavigationUrl()}
        onClick={onViewProgressClick}
      >
        {t('view-progress')}
      </Button>
    </div>
  );
};

export default GoalButtons;
