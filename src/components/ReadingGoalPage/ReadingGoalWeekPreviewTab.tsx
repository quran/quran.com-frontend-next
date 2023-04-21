import { useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import { ReadingGoalPeriod, ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import styles from './ReadingGoalPage.module.scss';

import DataContext from '@/contexts/DataContext';
import HoverablePopover from '@/dls/Popover/HoverablePopover';
import Spinner from '@/dls/Spinner/Spinner';
import {
  CreateReadingGoalRequest,
  EstimatedReadingGoal,
  ReadingGoalType,
} from '@/types/auth/ReadingGoal';
import { estimateReadingGoal } from '@/utils/auth/api';
import { makeEstimateReadingGoalUrl } from '@/utils/auth/apiPaths';
import { getChapterData } from '@/utils/chapter';
import { dateToReadableFormat, secondsToReadableFormat, getFullDayName } from '@/utils/datetime';
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

  const { data, isValidating } = useSWR(
    makeEstimateReadingGoalUrl(),
    () => estimateReadingGoal(getPayload(state)),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
    },
  );

  const getDailyAmount = (idx: number) => {
    const { type } = state;
    const day = data.data.week[idx];

    if (type === ReadingGoalType.RANGE) {
      const range = day.amount as string;

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

    const numberAmount = day.amount as number;
    if (type === ReadingGoalType.TIME) {
      return `${t('reciter:read')} ${secondsToReadableFormat(numberAmount, t, lang)}`;
    }

    const pages = Number(numberAmount.toFixed(2));
    return `${t('reciter:read')} ${t('x-pages', {
      count: pages,
      pages: toLocalizedNumber(pages, lang),
    })}`;
  };

  const getSkeleton = () => {
    return Array.from({
      length: Math.min(state.period === ReadingGoalPeriod.Continuous ? state.duration : 7, 7),
      // eslint-disable-next-line @typescript-eslint/naming-convention
    }).map((_, idx) => (
      // eslint-disable-next-line react/no-array-index-key
      <li key={idx} className={styles.dayPreview}>
        <Spinner />
      </li>
    ));
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{t('preview-schedule.title')}</h1>
        <p className={styles.subtitle}>{t('preview-schedule.description')}</p>
      </div>
      <ol className={classNames(styles.optionsContainer, styles.previewWrapper)}>
        {isValidating
          ? getSkeleton()
          : data.data.week.map((day: EstimatedReadingGoal['week'][number], idx: number) => {
              const date = new Date(day.date);

              return (
                // eslint-disable-next-line react/no-array-index-key
                <li key={idx} className={styles.dayPreview}>
                  <HoverablePopover content={dateToReadableFormat(date, lang)}>
                    <h3>{getFullDayName(date, lang)}</h3>
                  </HoverablePopover>

                  <p>{getDailyAmount(idx)}</p>
                </li>
              );
            })}

        {nav}
      </ol>
    </>
  );
};

export default ReadingGoalWeekPreviewTab;
