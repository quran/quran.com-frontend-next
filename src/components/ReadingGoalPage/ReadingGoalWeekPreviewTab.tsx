import { useMemo, useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import styles from './ReadingGoalPage.module.scss';
import { ReadingGoalTabProps } from './useReadingGoalReducer';

import DataContext from '@/contexts/DataContext';
import Spinner from '@/dls/Spinner/Spinner';
import { CreateReadingGoalRequest, ReadingGoalType } from '@/types/auth/ReadingGoal';
import { estimateReadingGoal } from '@/utils/auth/api';
import { makeEstimateReadingGoalUrl } from '@/utils/auth/apiPaths';
import { getChapterData } from '@/utils/chapter';
import { secondsToReadableFormat } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

const getPayload = (state: ReadingGoalTabProps['state']): CreateReadingGoalRequest => {
  const payload: CreateReadingGoalRequest = {
    type: state.type,
    amount: {
      [ReadingGoalType.PAGES]: state.pages,
      [ReadingGoalType.TIME]: state.seconds,
      [ReadingGoalType.RANGE]: `${state.rangeStartVerse}-${state.rangeEndVerse}`,
    }[state.type],
  };

  if (state.period === 'continuous') payload.duration = state.duration;

  return payload;
};

const ReadingGoalWeekPreviewTab: React.FC<ReadingGoalTabProps> = ({ state, nav }) => {
  const { t, lang } = useTranslation('reading-goal');
  const chaptersData = useContext(DataContext);

  const week = useMemo(() => {
    // get an array of today + next 6 days
    const days: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return days;
  }, []);

  const { data, isValidating } = useSWR(
    makeEstimateReadingGoalUrl(),
    () => estimateReadingGoal(getPayload(state)),
    {
      revalidateOnMount: true,
    },
  );
  const isLoading = !data && isValidating;

  const getDailyAmount = (idx: number) => {
    if (data.data.type === ReadingGoalType.RANGE) {
      const range = 'ranges' in data.data ? data.data.ranges[idx] : data.data.dailyAmount;
      const [start, end] = range.split('-');
      const [startingChapter, startingVerse] = getVerseAndChapterNumbersFromKey(start);
      const [endingChapter, endingVerse] = getVerseAndChapterNumbersFromKey(end);

      const startingChapterName = getChapterData(chaptersData, startingChapter).transliteratedName;
      const endingChapterName = getChapterData(chaptersData, endingChapter).transliteratedName;

      return (
        <div className={styles.rangePreview}>
          <p>
            {t('reciter:read')} {startingChapterName} {startingVerse}
          </p>
          <p>
            {t('common:to').toLowerCase()} {endingChapterName} {endingVerse}
          </p>
        </div>
      );
    }

    if (data.data.type === ReadingGoalType.TIME) {
      return `${t('reciter:read')} ${secondsToReadableFormat(data.data.dailyAmount, t, lang)}`;
    }

    const pages = data.data.dailyAmount;
    return `${t('reciter:read')} ${t('x-pages', {
      count: pages,
      pages: toLocalizedNumber(pages, lang),
    })}`;
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{t('preview-schedule.title')}</h1>
        <p className={styles.subtitle}>{t('preview-schedule.description')}</p>
      </div>
      <ol className={classNames(styles.optionsContainer, styles.previewWrapper)}>
        {week.map((day, idx) => (
          <li key={day.getDate()} className={styles.dayPreview}>
            <h3>{t('day-x', { day: idx + 1 })}</h3>
            {isLoading ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <p>{getDailyAmount(idx)}</p>
            )}
          </li>
        ))}
        {nav}
      </ol>
    </>
  );
};

export default ReadingGoalWeekPreviewTab;
