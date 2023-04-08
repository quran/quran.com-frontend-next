import { useMemo } from 'react';

import { Translate } from 'next-translate';
import useTranslation from 'next-translate/useTranslation';

import ReadingGoalInput from '../ReadingGoal/ReadingGoalInput';

import { ReadingGoalPeriod, ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import styles from './ReadingGoalPage.module.scss';

import Select, { SelectOption, SelectSize } from '@/dls/Forms/Select';
import { toLocalizedNumber } from '@/utils/locale';

const generateDaysOptions = (t: Translate, locale: string) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const options: SelectOption[] = new Array(90).fill(null).map((_, i) => {
    const day = i + 1;
    return {
      value: day.toString(),
      label: t('x-days', { count: day, days: toLocalizedNumber(day, locale) }),
    };
  });

  return options;
};

const ReadingGoalTargetAmountTab: React.FC<ReadingGoalTabProps> = ({ state, dispatch, nav }) => {
  const { t, lang } = useTranslation('reading-goal');
  const { type, period, pages, seconds, rangeStartVerse, rangeEndVerse, duration } = state;
  const dayOptions = useMemo(() => generateDaysOptions(t, lang), [t, lang]);

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
              onChange={(d) => dispatch({ type: 'SET_DURATION', payload: { duration: Number(d) } })}
            />
          </div>
        )}
        {nav}
      </div>
    </>
  );
};

export default ReadingGoalTargetAmountTab;
