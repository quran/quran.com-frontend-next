/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { useState, useContext, useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import useReadingGoalReducer, { ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import styles from './ReadingGoalPage.module.scss';
import { logTabClick, logTabInputChange, logTabNextClick, TabKey, tabsArray } from './utils/tabs';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize } from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import layoutStyle from '@/pages/index.module.scss';
import { selectQuranFont, selectQuranMushafLines } from '@/redux/slices/QuranReader/styles';
import {
  CreateReadingGoalRequest,
  ReadingGoalPeriod,
  ReadingGoalType,
} from '@/types/auth/ReadingGoal';
import { getMushafId } from '@/utils/api';
import { addReadingGoal } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { logFormSubmission } from '@/utils/eventLogger';
import { isValidPageId, isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

const ReadingGoalOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const chaptersData = useContext(DataContext);

  const quranFont = useSelector(selectQuranFont, shallowEqual);
  const mushafLines = useSelector(selectQuranMushafLines, shallowEqual);
  const { mushaf } = getMushafId(quranFont, mushafLines);

  const [loading, setLoading] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [state, dispatch] = useReadingGoalReducer();
  const toast = useToast();
  const { cache } = useSWRConfig();

  const addReadingGoalAndClearCache = useCallback(
    async (data: CreateReadingGoalRequest) => {
      await addReadingGoal(data).then(() => {
        cache.delete(makeStreakUrl());
      });
    },
    [cache],
  );

  const Tab = tabsArray[tabIdx];

  const onSubmit = async () => {
    let amount: string | number;

    if (state.type === ReadingGoalType.PAGES) amount = state.pages;
    else if (state.type === ReadingGoalType.TIME) amount = state.seconds;
    else amount = `${state.rangeStartVerse}-${state.rangeEndVerse}`;

    const data: CreateReadingGoalRequest = {
      mushafId: mushaf,
      type: state.type,
      amount,
    };
    if (state.period === ReadingGoalPeriod.Continuous) {
      data.duration = state.duration;
    }

    logFormSubmission('create_goal', { duration: null, ...data });

    setLoading(true);

    try {
      await addReadingGoalAndClearCache(data);
      toast(t('reading-goal:set-reading-goal-success'), {
        status: ToastStatus.Success,
      });
      router.push('/');
    } catch (e) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    }

    setLoading(false);
  };

  const isPreviewTab = Tab.key === TabKey.PreviewTab;
  const percentage = isPreviewTab ? 100 : (tabIdx / tabsArray.length) * 100;

  const onPrev = () => {
    if (tabIdx !== 0 && state.exampleKey !== 'custom') {
      setTabIdx(0);
      logTabClick(Tab.key, 'previous');
    } else {
      setTabIdx((prevIdx) => prevIdx - 1);
      logTabClick(Tab.key, 'previous');
    }
  };

  const onNext = () => {
    if (!isPreviewTab) {
      if (tabIdx === 0 && state.exampleKey !== 'custom') {
        // if the user selected an example, skip to the preview tab
        setTabIdx(tabsArray.length - 1);
      } else {
        // otherwise, go to the next tab
        setTabIdx((prevIdx) => prevIdx + 1);
      }

      logTabNextClick(Tab.key, state);
    } else {
      onSubmit();
    }
  };

  const getIsNextDisabled = () => {
    const SECONDS_LIMIT = 4 * 60 * 60; // 4 hours
    const MIN_SECONDS = 60; // 1 minute

    // if the user is on the examples tab and hasn't selected an example, disable the next button
    if (Tab.key === TabKey.ExamplesTab && !state.exampleKey) return true;

    if (Tab.key === TabKey.AmountTab) {
      // if the user selected a pages goal and didn't enter a valid amount of pages, disable the next button
      if (state.type === ReadingGoalType.PAGES && !isValidPageId(state.pages)) return true;

      // if the user selected a time goal and didn't enter a valid amount of seconds, disable the next button
      // in theory, this should never happen because the input is a select, but just in case
      if (
        state.type === ReadingGoalType.TIME &&
        (Number.isNaN(state.seconds) ||
          state.seconds > SECONDS_LIMIT ||
          state.seconds < MIN_SECONDS)
      ) {
        return true;
      }

      // if the user selected a range goal and didn't enter a valid range, disable the next button
      if (state.type === ReadingGoalType.RANGE) {
        if (!state.rangeStartVerse || !state.rangeEndVerse) return true;
        if (
          !isValidVerseKey(chaptersData, state.rangeStartVerse) ||
          !isValidVerseKey(chaptersData, state.rangeEndVerse)
        ) {
          return true;
        }

        // check if the starting verse key is greater than the ending verse key
        const [startingChapter, startingVerse] = getVerseAndChapterNumbersFromKey(
          state.rangeStartVerse,
        );
        const [endingChapter, endingVerse] = getVerseAndChapterNumbersFromKey(state.rangeEndVerse);

        if (startingChapter === endingChapter && Number(startingVerse) > Number(endingVerse)) {
          return true;
        }
      }
    }

    return false;
  };

  const logClick: ReadingGoalTabProps['logClick'] = (event) => {
    logTabClick(Tab.key, event);
  };

  const logChange: ReadingGoalTabProps['logChange'] = (input, values, metadata) => {
    logTabInputChange(Tab.key, input, values, metadata);
  };

  return (
    <div className={classNames(layoutStyle.flowItem)}>
      <Progress value={percentage} />

      <div className={styles.tabContainer}>
        {loading ? (
          <Spinner isCentered size={SpinnerSize.Large} />
        ) : (
          <Tab.Component
            onTabChange={setTabIdx}
            state={state}
            dispatch={dispatch}
            logClick={logClick}
            logChange={logChange}
            nav={
              <div className={styles.navigationContainer}>
                {tabIdx > 0 && (
                  <Button
                    className={styles.navigateButton}
                    size={ButtonSize.Large}
                    prefix={<ChevronLeftIcon />}
                    onClick={onPrev}
                  >
                    {t('common:prev')}
                  </Button>
                )}

                <Button
                  className={styles.navigateButton}
                  size={ButtonSize.Large}
                  suffix={!isPreviewTab ? <ChevronRightIcon /> : undefined}
                  isDisabled={getIsNextDisabled()}
                  onClick={onNext}
                >
                  {!isPreviewTab ? t('common:next') : t('common:submit')}
                </Button>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
};

export default ReadingGoalOnboarding;
