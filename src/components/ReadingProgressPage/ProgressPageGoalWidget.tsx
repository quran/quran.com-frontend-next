import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import DeleteReadingGoalModal from '../ReadingGoal/DeleteReadingGoalModal';
import UpdateReadingGoalModal from '../ReadingGoal/UpdateReadingGoalModal';

import styles from './ReadingProgressPage.module.scss';

import Button from '@/dls/Button/Button';
import CircularProgressbar from '@/dls/CircularProgress';
import Skeleton from '@/dls/Skeleton/Skeleton';
import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import useGetContinueReadingUrl from '@/hooks/useGetContinueReadingUrl';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getReadingGoalNavigationUrl } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';

interface ProgressPageGoalWidgetProps {
  goal?: StreakWithMetadata['goal'];
  isLoading: boolean;
}

const ProgressPageGoalWidget = ({ goal, isLoading }: ProgressPageGoalWidgetProps) => {
  const { t, lang } = useTranslation('reading-progress');
  const [modalVisible, setModalVisible] = useState({
    update: false,
    delete: false,
  });
  const percent = goal?.isCompleted ? 100 : Math.min(goal?.progress?.percent || 0, 100);
  const localizedPercent = toLocalizedNumber(percent, lang);
  const continueReadingUrl = useGetContinueReadingUrl();

  const onUpdateModalChange = (visible: boolean) => {
    setModalVisible({ ...modalVisible, update: visible });
  };

  const onDeleteModalChange = (visible: boolean) => {
    setModalVisible({ ...modalVisible, delete: visible });
  };

  if (isLoading) {
    return (
      <Skeleton className={classNames(styles.widget, styles.emptyWidget)}>
        <Button href={getReadingGoalNavigationUrl()}>
          {t('reading-goal:create-reading-goal')}
        </Button>
      </Skeleton>
    );
  }

  if (!goal) {
    const onCreateReadingGoalClick = () => {
      logButtonClick('progress_page_create_goal');
    };

    return (
      <div className={classNames(styles.widget, styles.emptyWidget)}>
        <Button href={getReadingGoalNavigationUrl()} onClick={onCreateReadingGoalClick}>
          {t('reading-goal:create-reading-goal')}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.progressWidget}>
      <div className={styles.progressWidgetWrapper}>
        <div className={styles.circularProgressbar}>
          <CircularProgressbar
            text={`${localizedPercent}%`}
            value={percent}
            maxValue={100}
            strokeWidth={12}
            classes={{
              path: styles.circularProgressbarPath,
              trail: styles.circularProgressbarTrail,
              text: styles.circularProgressbarText,
            }}
          />
        </div>
        <div className={styles.progressWidgetContent}>
          <p className={styles.progressWidgetTitle}>{t('reading-goal:daily-progress')}</p>
          <p
            className={styles.progressWidgetDaysLeft}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: t('reading-goal:remaining-days', {
                count: goal.progress.daysLeft,
                days: toLocalizedNumber(goal.progress.daysLeft, lang),
              }),
            }}
          />
        </div>
      </div>
      <div className={styles.progressWidgetCta}>
        {!isMobile() && (
          <Button href={continueReadingUrl} className={styles.continueReadingButton}>
            {t('reading-goal:continue-reading')}
          </Button>
        )}
        <UpdateReadingGoalModal
          goal={goal}
          isOpen={modalVisible.update}
          onModalChange={onUpdateModalChange}
          onShowDeleteModal={() => {
            logButtonClick('reading_goal_delete');
            setModalVisible({ update: false, delete: true });
          }}
        />
        <DeleteReadingGoalModal isOpen={modalVisible.delete} onModalChange={onDeleteModalChange} />
      </div>
    </div>
  );
};

export default ProgressPageGoalWidget;
