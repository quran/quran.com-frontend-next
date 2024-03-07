import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './DaysCounter.module.scss';

import StreakDefinitionModal from '@/components/HomePage/QuranGrowthJourneySection/CollapsibleSection/QuranReadingGoals/StreakDefinitionModal';
import { toLocalizedNumber } from '@/utils/locale';

type Props = {
  streak: number;
  // TODO: strongly type this
  currentActivityDay: any;
};

const DaysCounter: React.FC<Props> = ({ streak, currentActivityDay }) => {
  const { t, lang } = useTranslation('reading-goal');
  const localizedStreak = toLocalizedNumber(streak, lang);
  const hasUserReadToday = currentActivityDay?.hasRead;
  return (
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
};

export default DaysCounter;
