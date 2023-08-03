import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import ReadingGoalInput, { ReadingGoalInputProps } from '../ReadingGoal/ReadingGoalInput';

import { ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import styles from './ReadingGoalPage.module.scss';

import Select, { SelectSize } from '@/dls/Forms/Select';
import { QuranGoalPeriod } from '@/types/auth/Goal';
import { generateDurationDaysOptions } from '@/utils/generators';

type SetDurationAction = {
  type: 'SET_DURATION';
  payload: { duration: number };
};

type SetRangeAction = {
  type: 'SET_RANGE';
  payload: {
    startVerse: string;
    endVerse: string;
  };
};

type SetPagesAction = {
  type: 'SET_PAGES';
  payload: { pages: number };
};

type SetSecondsAction = {
  type: 'SET_SECONDS';
  payload: { seconds: number };
};

const setDurationAction = (duration: number): SetDurationAction => ({
  type: 'SET_DURATION',
  payload: { duration },
});

const setRangeAction = (range): SetRangeAction => ({
  type: 'SET_RANGE',
  payload: range,
});

const setPagesAction = (pages: number): SetPagesAction => ({
  type: 'SET_PAGES',
  payload: { pages },
});

const setSecondsAction = (seconds: number): SetSecondsAction => ({
  type: 'SET_SECONDS',
  payload: { seconds },
});

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

    dispatch(setDurationAction(newDuration));
  };

  const onRangeChange: ReadingGoalInputProps['onRangeChange'] = (newRange) => {
    dispatch(setRangeAction(newRange));
  };

  const onPagesChange: ReadingGoalInputProps['onPagesChange'] = (newPages) => {
    dispatch(setPagesAction(newPages));
  };

  const onSecondsChange: ReadingGoalInputProps['onSecondsChange'] = (newSeconds) => {
    dispatch(setSecondsAction(newSeconds));
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
          onRangeChange={onRangeChange}
          onPagesChange={onPagesChange}
          onSecondsChange={onSecondsChange}
          logChange={logChange}
        />
        {period === QuranGoalPeriod.Continuous && (
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
