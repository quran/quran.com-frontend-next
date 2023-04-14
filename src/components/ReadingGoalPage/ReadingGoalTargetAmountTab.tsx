import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ReadingGoalInput from '../ReadingGoal/ReadingGoalInput';

import { ReadingGoalPeriod, ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import styles from './ReadingGoalPage.module.scss';

import Select, { SelectSize } from '@/dls/Forms/Select';
import { generateDurationDaysOptions } from '@/utils/generators';

const ReadingGoalTargetAmountTab: React.FC<ReadingGoalTabProps> = ({
  state,
  dispatch,
  nav,
  logChange,
}) => {
  const { t, lang } = useTranslation('reading-goal');
  const { type, period, pages, seconds, rangeStartVerse, rangeEndVerse, duration } = state;
  const dayOptions = useMemo(() => generateDurationDaysOptions(t, lang), [t, lang]);

  const onDurationChange = (d: string) => {
    const newDuration = Number(d);
    logChange('duration', { currentValue: duration, newValue: newDuration });

    dispatch({ type: 'SET_DURATION', payload: { duration: newDuration } });
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{t('goal-target.title')}</h1>
        <p className={styles.subtitle}>{t('goal-target.description')}</p>
      </div>
      <div className={styles.optionsContainer}>
        <ReadingGoalInput
          type={type}
          pages={pages}
          seconds={seconds}
          rangeStartVerse={rangeStartVerse}
          rangeEndVerse={rangeEndVerse}
          onRangeChange={(newRange) => dispatch({ type: 'SET_RANGE', payload: newRange })}
          onPagesChange={(newPages) =>
            dispatch({ type: 'SET_PAGES', payload: { pages: newPages } })
          }
          onSecondsChange={(newSeconds) =>
            dispatch({ type: 'SET_SECONDS', payload: { seconds: newSeconds } })
          }
          logChange={logChange}
        />
        {period === ReadingGoalPeriod.Continuous && (
          <div className={styles.inputContainer}>
            <label htmlFor="duration" className={styles.label}>
              {t('duration')}
            </label>
            <Select
              id="duration"
              name="duration"
              size={SelectSize.Large}
              className={styles.input}
              options={dayOptions}
              value={duration.toString()}
              onChange={onDurationChange}
            />
          </div>
        )}
        {nav}
      </div>
    </>
  );
};

export default ReadingGoalTargetAmountTab;
