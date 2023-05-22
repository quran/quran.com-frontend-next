import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingStreak.module.scss';

import Button from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { getReadingGoalNavigationUrl } from '@/utils/navigation';

const StreakIntroductionWidget = () => {
  const { t } = useTranslation('reading-goal');

  return (
    <div className={styles.wrapper}>
      <Link href="/product-updates/quran-reading-streaks" className={styles.announcementPill}>
        {t('common:new')} {t('common:learn-more')}
      </Link>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>

      <div className={styles.container}>
        <div>
          <p className={styles.streakTitle}>{t('reading-goal-title')}</p>
        </div>
      </div>

      <div className={styles.goalContainer}>
        <Trans components={{ br: <br /> }} i18nKey="reading-goal:reading-goal-description" />
      </div>
      <div className={styles.actionsContainer}>
        <Button href={isLoggedIn() ? getReadingGoalNavigationUrl() : '/login'}>
          {t('create-reading-goal')}
        </Button>
      </div>
    </div>
  );
};

export default StreakIntroductionWidget;
