import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingStreak.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl, getReadingGoalNavigationUrl } from '@/utils/navigation';

const StreakIntroductionWidget = () => {
  const { t } = useTranslation('home');

  const onCreateReadingGoalClicked = () => {
    logButtonClick('homepage_qgj_create_goal_clicked', {
      isLoggedIn: isLoggedIn(),
    });
  };

  const url = getReadingGoalNavigationUrl();

  return (
    <>
      <p>{t('qgj.quran-reading-goals.desc.logged-out')}</p>
      <div className={styles.actionsContainer}>
        <Button
          onClick={onCreateReadingGoalClicked}
          size={ButtonSize.Small}
          href={isLoggedIn() ? url : getLoginNavigationUrl(url)}
        >
          {t('reading-goal:create-reading-goal')}
        </Button>
      </div>
    </>
  );
};

export default StreakIntroductionWidget;
