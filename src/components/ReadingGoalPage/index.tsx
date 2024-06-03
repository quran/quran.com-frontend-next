/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable max-lines */
import { useCallback, useContext, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import useReadingGoalReducer, { ReadingGoalTabProps } from './hooks/useReadingGoalReducer';
import styles from './ReadingGoalPage.module.scss';
import { logTabClick, logTabInputChange, logTabNextClick, TabKey, tabsArray } from './utils/tabs';
import { validateReadingGoalData } from './utils/validator';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useGetMushaf from '@/hooks/useGetMushaf';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import layoutStyle from '@/pages/index.module.scss';
import { CreateGoalRequest, GoalCategory, GoalType, QuranGoalPeriod } from '@/types/auth/Goal';
import { addReadingGoal } from '@/utils/auth/api';
import { makeStreakUrl } from '@/utils/auth/apiPaths';
import { logFormSubmission } from '@/utils/eventLogger';

const ReadingGoalOnboarding: React.FC = () => {
  const { t } = useTranslation('reading-goal');
  const router = useRouter();
  const chaptersData = useContext(DataContext);
  const mushaf = useGetMushaf();

  const [loading, setLoading] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [state, dispatch] = useReadingGoalReducer();
  const toast = useToast();
  const { cache } = useSWRConfig();

  const addReadingGoalAndClearCache = useCallback(
    async (data: CreateGoalRequest) => {
      await addReadingGoal(data).then(() => {
        cache.delete(makeStreakUrl());
      });
    },
    [cache],
  );

  const Tab = tabsArray[tabIdx];

  const onSubmit = async () => {
    let amount: string | number;

    if (state.type === GoalType.PAGES) amount = state.pages;
    else if (state.type === GoalType.TIME) amount = state.seconds;
    else amount = `${state.rangeStartVerse}-${state.rangeEndVerse}`;

    const data: CreateGoalRequest = {
      mushafId: mushaf,
      type: state.type,
      amount,
      category: GoalCategory.QURAN,
    };
    if (state.period === QuranGoalPeriod.Continuous) {
      data.duration = state.duration;
    }

    logFormSubmission('create_goal', { duration: null, ...data });

    setLoading(true);

    try {
      await addReadingGoalAndClearCache(data);
      toast(t('set-reading-goal-success'), {
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
    // if the user is on the examples tab and hasn't selected an example, disable the next button
    if (Tab.key === TabKey.ExamplesTab && !state.exampleKey) return true;

    if (Tab.key === TabKey.AmountTab) {
      return !validateReadingGoalData(
        chaptersData,
        {
          type: state.type,
          pages: state.pages,
          seconds: state.seconds,
          range: { startVerse: state.rangeStartVerse, endVerse: state.rangeEndVerse },
        },
        mushaf,
      );
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
                    type={ButtonType.Secondary}
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
                  {!isPreviewTab ? t('common:next') : t('start-journey')}
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
