import { useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import DataFetcher from '../DataFetcher';

import { ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import styles from './ReadingGoalPage.module.scss';
import ReadingGoalWeekPreviewTabSkeleton from './ReadingGoalWeekPreviewTabSkeleton';

import DataContext from '@/contexts/DataContext';
import HoverablePopover from '@/dls/Popover/HoverablePopover';
import { selectQuranFont, selectQuranMushafLines } from '@/redux/slices/QuranReader/styles';
import {
  EstimatedGoalDay,
  RangeEstimatedQuranGoalDay,
  QuranGoalPeriod,
  GoalType,
  EstimateGoalRequest,
  EstimatedQuranGoal,
} from '@/types/auth/Goal';
import { Mushaf } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { privateFetcher } from '@/utils/auth/api';
import { makeEstimateReadingGoalUrl } from '@/utils/auth/apiPaths';
import { getChapterData } from '@/utils/chapter';
import { dateToReadableFormat, secondsToReadableFormat, getFullDayName } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';
import { convertNumberToDecimal } from '@/utils/number';
import { parseVerseRange } from '@/utils/verseKeys';

const makePayload = (
  state: ReadingGoalTabProps['state'],
  mushafId: Mushaf,
): EstimateGoalRequest => {
  const payload: EstimateGoalRequest = {
    mushafId,
    type: state.type,
    amount: {
      [GoalType.PAGES]: state.pages,
      [GoalType.TIME]: state.seconds,
      [GoalType.RANGE]: `${state.rangeStartVerse}-${state.rangeEndVerse}`,
    }[state.type],
  };

  if (state.period === QuranGoalPeriod.Continuous) payload.duration = state.duration;

  return payload;
};

// this is the maximum number of days that we'll show in the preview for continuous goals
// if the user selects a duration that is longer than this, we will show in the last day "+X more days"
const MAX_DAYS = 6;

const ReadingGoalWeekPreviewTab: React.FC<ReadingGoalTabProps> = ({ state, nav }) => {
  const { t, lang } = useTranslation('reading-goal');
  const chaptersData = useContext(DataContext);

  const quranFont = useSelector(selectQuranFont, shallowEqual);
  const mushafLines = useSelector(selectQuranMushafLines, shallowEqual);
  const { mushaf } = getMushafId(quranFont, mushafLines);

  const payload = makePayload(state, mushaf);

  const getDailyAmount = (data: EstimatedQuranGoal, idx: number) => {
    const { type } = state;
    const day = data.week[idx];

    if (type === GoalType.RANGE) {
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
            {t('reciter:read')} {startingChapterName}{' '}
            {toLocalizedNumber(Number(startingVerse), lang)}
          </p>
          <p>
            {t('common:to').toLowerCase()} {endingChapterName}{' '}
            {toLocalizedNumber(Number(endingVerse), lang)}
          </p>
        </div>
      );
    }

    const numberAmount = day.amount as number;
    if (type === GoalType.TIME) {
      return `${t('reciter:read')} ${secondsToReadableFormat(numberAmount, t, lang)}`;
    }

    const pages = convertNumberToDecimal(numberAmount, 2);
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
        <DataFetcher
          queryKey={makeEstimateReadingGoalUrl(payload)}
          fetcher={privateFetcher}
          loading={() => (
            <ReadingGoalWeekPreviewTabSkeleton
              numberOfDays={state.period === QuranGoalPeriod.Continuous ? state.duration : 7}
            />
          )}
          render={(response) => {
            const { data } = response as { data: EstimatedQuranGoal };

            return (
              <>
                {data.week.map(
                  (day: EstimatedGoalDay | RangeEstimatedQuranGoalDay, idx: number) => {
                    const date = new Date(day.date);

                    const shouldShowNumberOfDaysAfterPreview =
                      state.duration > MAX_DAYS && state.period === QuranGoalPeriod.Continuous;
                    const isLastElement = shouldShowNumberOfDaysAfterPreview && idx > MAX_DAYS - 1;

                    return (
                      <li
                        key={day.date}
                        className={classNames(styles.dayPreview, isLastElement && styles.lastDay)}
                      >
                        {isLastElement ? (
                          <h3>
                            {t('plus-x-more-days', {
                              count: state.duration - MAX_DAYS,
                              days: toLocalizedNumber(state.duration - MAX_DAYS, lang),
                            })}
                          </h3>
                        ) : (
                          <>
                            <HoverablePopover content={dateToReadableFormat(date, lang)}>
                              <h3>{getFullDayName(date, lang)}</h3>
                            </HoverablePopover>

                            <p>{getDailyAmount(data, idx)}</p>
                          </>
                        )}
                      </li>
                    );
                  },
                )}
              </>
            );
          }}
        />

        {nav}
      </ol>
    </>
  );
};

export default ReadingGoalWeekPreviewTab;
