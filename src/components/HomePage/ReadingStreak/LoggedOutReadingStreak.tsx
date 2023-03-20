import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingStreak.module.scss';

import Button from '@/dls/Button/Button';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';

const LoggedOutReadingStreak = () => {
  const { t } = useTranslation('reading-goal');

  return (
    <div className={styles.wrapper}>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>

      <div className={styles.container}>
        <div>
          <p className={styles.streakTitle}>{t('reading-goal-title')}</p>
        </div>
      </div>
      <div className={styles.goalContainer}>{t('reading-goal-description')}</div>

      <div className={styles.actionsContainer}>
        <Button href="/login">{t('create-reading-goal')}</Button>
      </div>
    </div>
  );
};

export default LoggedOutReadingStreak;
