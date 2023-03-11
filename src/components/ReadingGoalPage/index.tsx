/* eslint-disable max-lines */
import { useState, useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import ReadingGoalExamplesTab from './ReadingGoalExamplesTab';
import styles from './ReadingGoalPage.module.scss';
import ReadingGoalTargetAmountTab from './ReadingGoalTargetAmountTab';
import ReadingGoalTimeTab from './ReadingGoalTimeTab';
import ReadingGoalTypeTab from './ReadingGoalTypeTab';
import ReadingGoalWeekPreviewTab from './ReadingGoalWeekPreviewTab';
import useReadingGoalReducer from './useReadingGoalReducer';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize } from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import layoutStyle from '@/pages/index.module.scss';
import { CreateReadingGoalRequest, ReadingGoalType } from '@/types/auth/ReadingGoal';
import { addReadingGoal } from '@/utils/auth/api';
import { isValidPageId, isValidVerseKey } from '@/utils/validator';

const tabs = {
  examples: ReadingGoalExamplesTab,
  time: ReadingGoalTimeTab,
  type: ReadingGoalTypeTab,
  amount: ReadingGoalTargetAmountTab,
  preview: ReadingGoalWeekPreviewTab,
} as const;

const tabsArray = (Object.keys(tabs) as (keyof typeof tabs)[]).map((key) => ({
  key,
  Component: tabs[key],
}));

const ReadingGoalOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const chaptersData = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [state, dispatch] = useReadingGoalReducer();
  const toast = useToast();

  const Tab = tabsArray[tabIdx];

  const onSubmit = async () => {
    let amount: string | number;

    if (state.type === ReadingGoalType.PAGES) amount = state.pages;
    else if (state.type === ReadingGoalType.TIME) amount = state.seconds;
    else amount = `${state.rangeStartVerse}-${state.rangeEndVerse}`;

    const data: CreateReadingGoalRequest = {
      type: state.type,
      amount,
    };
    if (state.period === 'continuous') data.duration = state.duration;

    setLoading(true);

    try {
      await addReadingGoal(data);
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

  const isPreviewTab = Tab.key === 'preview';
  const percentage = isPreviewTab ? 100 : (tabIdx / tabsArray.length) * 100;

  const onPrev = () => {
    if (tabIdx !== 0 && state.exampleKey !== 'custom') {
      setTabIdx(0);
    } else {
      setTabIdx((prevIdx) => prevIdx - 1);
    }
  };

  const onNext = () => {
    if (!isPreviewTab) {
      if (tabIdx === 0 && state.exampleKey !== 'custom') {
        setTabIdx(tabsArray.length - 1);
      } else {
        setTabIdx((prevIdx) => prevIdx + 1);
      }
    } else {
      onSubmit();
    }
  };

  const getIsNextDisabled = () => {
    const SECONDS_LIMIT = 4 * 60 * 60; // 4 hours
    const MIN_SECONDS = 60; // 1 minute

    // if the user is on the examples tab and hasn't selected an example, disable the next button
    if (Tab.key === 'examples' && !state.exampleKey) return true;

    if (Tab.key === 'amount') {
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
      if (
        state.type === ReadingGoalType.RANGE &&
        (!isValidVerseKey(chaptersData, state.rangeStartVerse) ||
          !isValidVerseKey(chaptersData, state.rangeEndVerse))
      ) {
        return true;
      }
    }

    return false;
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
