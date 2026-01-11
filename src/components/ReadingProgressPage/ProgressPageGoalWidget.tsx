import { useContext, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import DeleteReadingGoalModal from '../ReadingGoal/DeleteReadingGoalModal';
import UpdateReadingGoalModal from '../ReadingGoal/UpdateReadingGoalModal';

import ProgressPageGoalWidgetDescription from './ProgressPageGoalWidgetDescription';
import styles from './ReadingProgressPage.module.scss';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import CircularProgressbar from '@/dls/CircularProgress';
import Link from '@/dls/Link/Link';
import Skeleton from '@/dls/Skeleton/Skeleton';
import { StreakWithMetadata } from '@/hooks/auth/useGetStreakWithMetadata';
import useGetContinueReadingUrl from '@/hooks/useGetContinueReadingUrl';
import useIsMobile from '@/hooks/useIsMobile';
import ArrowIcon from '@/icons/arrow.svg';
import { CurrentQuranActivityDay } from '@/types/auth/ActivityDay';
import { GoalType } from '@/types/auth/Goal';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl, getReadingGoalNavigationUrl } from '@/utils/navigation';

interface Props {
  goal?: StreakWithMetadata['goal'];
  isLoading: boolean;
  currentActivityDay: CurrentQuranActivityDay;
}

const ProgressPageGoalWidget = ({ goal, isLoading, currentActivityDay }: Props) => {
  const { t, lang } = useTranslation('reading-goal');
  const chaptersData = useContext(DataContext);
  const isMobile = useIsMobile();
  const [modalVisible, setModalVisible] = useState({
    update: false,
    delete: false,
  });
  const percent = goal?.isCompleted ? 100 : Math.min(goal?.progress?.percent || 0, 100);
  const localizedPercent = toLocalizedNumber(percent, lang);
  const continueReadingUrl = useGetContinueReadingUrl();

  const onUpdateModalChange = (visible: boolean) => {
    setModalVisible((prev) => ({ ...prev, update: visible }));
  };

  const onDeleteModalChange = (visible: boolean) => {
    setModalVisible((prev) => ({ ...prev, delete: visible }));
  };

  const onShowDeleteModal = () => {
    logButtonClick('reading_goal_delete');
    setModalVisible((prev) => ({ ...prev, update: false, delete: true }));
  };

  const ctaUrl =
    goal?.type === GoalType.RANGE && goal?.progress?.nextVerseToRead
      ? getChapterWithStartingVerseUrl(goal.progress.nextVerseToRead)
      : continueReadingUrl;

  if (isLoading) {
    return (
      <Skeleton className={classNames(styles.widget, styles.emptyWidget)}>
        <Button href={getReadingGoalNavigationUrl()}>{t('create-reading-goal')}</Button>
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
          {t('create-reading-goal')}
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
          <p className={styles.progressWidgetTitle}>{t('daily-progress')}</p>
          <ProgressPageGoalWidgetDescription
            goal={goal}
            t={t}
            lang={lang}
            currentActivityDay={currentActivityDay}
            chaptersData={chaptersData}
          />
        </div>
        {isMobile && (
          <Link href={ctaUrl} className={styles.arrowLink}>
            <ArrowIcon />
          </Link>
        )}
      </div>
      <div className={styles.progressWidgetCta}>
        {!isMobile && (
          <Button href={ctaUrl} variant={ButtonVariant.Rounded}>
            {t('continue-reading')}
          </Button>
        )}
        <UpdateReadingGoalModal
          goal={goal}
          isOpen={modalVisible.update}
          onModalChange={onUpdateModalChange}
          onShowDeleteModal={onShowDeleteModal}
        />
        <DeleteReadingGoalModal isOpen={modalVisible.delete} onModalChange={onDeleteModalChange} />
      </div>
    </div>
  );
};

export default ProgressPageGoalWidget;
