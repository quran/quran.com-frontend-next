import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import layoutStyle from '../../pages/index.module.scss';

import ReadingGoalExamplesTab from './ReadingGoalExamplesTab';
import styles from './ReadingGoalPage.module.scss';
import ReadingGoalTargetAmountTab from './ReadingGoalTargetAmountTab';
import ReadingGoalTimeTab from './ReadingGoalTimeTab';
import ReadingGoalTypeTab from './ReadingGoalTypeTab';
import ReadingGoalWeekPreviewTab from './ReadingGoalWeekPreviewTab';
import useReadingGoalReducer, { ReadingGoalTabProps } from './useReadingGoalReducer';

import Button, { ButtonSize } from '@/dls/Button/Button';
import Progress from '@/dls/Progress';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { CreateReadingGoalRequest, ReadingGoalType } from '@/types/auth/ReadingGoal';
import { addReadingGoal } from '@/utils/auth/api';

const tabs = [
  ReadingGoalExamplesTab,
  ReadingGoalTimeTab,
  ReadingGoalTypeTab,
  ReadingGoalTargetAmountTab,
  ReadingGoalWeekPreviewTab,
];

const ReadingGoalOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [state, dispatch] = useReadingGoalReducer();
  const toast = useToast();

  const Tab = tabs[tabIdx] as React.FC<ReadingGoalTabProps>;

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
      // await addReadingGoal(data);
      console.log('data', data);
      toast('reading-goal:set-reading-goal-success', {
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

  const isSubmitTab = tabIdx === tabs.length - 1;
  const percentage = tabIdx === tabs.length - 1 ? 100 : (tabIdx / tabs.length) * 100;

  const onNext = () => {
    if (!isSubmitTab) {
      setTabIdx((prevIdx) => prevIdx + 1);
    } else {
      onSubmit();
    }
  };

  return (
    <div className={classNames(layoutStyle.flowItem)}>
      <Progress value={percentage} />

      <div className={styles.tabContainer}>
        {loading ? (
          <Spinner isCentered size={SpinnerSize.Large} />
        ) : (
          <Tab
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
                    onClick={() => {
                      setTabIdx((prevIdx) => prevIdx - 1);
                    }}
                  >
                    {t('common:prev')}
                  </Button>
                )}

                <Button
                  className={styles.navigateButton}
                  size={ButtonSize.Large}
                  suffix={!isSubmitTab ? <ChevronRightIcon /> : undefined}
                  onClick={onNext}
                >
                  {!isSubmitTab ? t('common:next') : t('common:submit')}
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
