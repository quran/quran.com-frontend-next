import { useMemo, useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import { ReadingGoalPeriod, ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import styles from './ReadingGoalPage.module.scss';

import DataContext from '@/contexts/DataContext';
import HoverablePopover from '@/dls/Popover/HoverablePopover';
import Spinner from '@/dls/Spinner/Spinner';
import { CreateReadingGoalRequest, ReadingGoalType } from '@/types/auth/ReadingGoal';
import { estimateReadingGoal } from '@/utils/auth/api';
import { makeEstimateReadingGoalUrl } from '@/utils/auth/apiPaths';
import { getChapterData } from '@/utils/chapter';
import { dateToReadableFormat, secondsToReadableFormat } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';
import { parseVerseRange } from '@/utils/verseKeys';

const getPayload = (state: ReadingGoalTabProps['state']): CreateReadingGoalRequest => {
  const payload: CreateReadingGoalRequest = {
    type: state.type,
    amount: {
      [ReadingGoalType.PAGES]: state.pages,
      [ReadingGoalType.TIME]: state.seconds,
      [ReadingGoalType.RANGE]: `${state.rangeStartVerse}-${state.rangeEndVerse}`,
    }[state.type],
  };

  if (state.period === ReadingGoalPeriod.Continuous) payload.duration = state.duration;

  return payload;
};

const ReadingGoalWeekPreviewTab: React.FC<ReadingGoalTabProps> = ({ state, nav }) => {
  const { t, lang } = useTranslation('reading-goal');
  const chaptersData = useContext(DataContext);

  const week = useMemo(() => {
    // get an array of today + next 6 days
    const days: Date[] = [];

    const total = state.period === ReadingGoalPeriod.Continuous ? state.duration : 7;

    for (let i = 0; i < total; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return days;
  }, [state.duration, state.period]);

  const { data, isValidating } = useSWR(
    makeEstimateReadingGoalUrl(),
    () => estimateReadingGoal(getPayload(state)),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
    },
  );

  const isLoading = !data && isValidating;

  const getDailyAmount = (idx: number) => {
    if (data.data.type === ReadingGoalType.RANGE) {
      const range = 'ranges' in data.data ? data.data.ranges[idx] : data.data.dailyAmount;
      const [
        { chapter: startingChapter, verse: startingVerse },
        { chapter: endingChapter, verse: endingVerse },
      ] = parseVerseRange(range);

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

    const pages = Number(data.data.dailyAmount.toFixed(2));
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
        {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
        {(data?.data && 'ranges' in data.data ? data.data.ranges : week).map((_, idx: number) => {
          const day = week[idx];

          return (
            <li key={day.getDate()} className={styles.dayPreview}>
              <HoverablePopover content={dateToReadableFormat(day, lang)}>
                <h3>{t('day-x', { day: toLocalizedNumber(idx + 1, lang) })}</h3>
              </HoverablePopover>

              {isLoading ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <p>{getDailyAmount(idx)}</p>
              )}
            </li>
          );
        })}
        {nav}
      </ol>
    </>
  );
};

export default ReadingGoalWeekPreviewTab;
