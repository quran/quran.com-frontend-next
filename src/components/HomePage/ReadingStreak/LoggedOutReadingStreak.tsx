import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../../public/images/moon-illustration.svg';

import styles from './ReadingStreak.module.scss';

import Button from '@/dls/Button/Button';

const LoggedOutReadingStreak = () => {
  const { t } = useTranslation('reading-goal');

  return (
    <div className={styles.wrapper}>
      <div className={styles.illustrationContainer}>
        <MoonIllustrationSVG />
      </div>

      <div className={styles.container}>
        <div>
          <p className={styles.streakTitle}>{t('reading-plan')}</p>
        </div>
      </div>
      <div className={styles.goalContainer}>{t('reading-plan-description')}</div>

      <div className={styles.actionsContainer}>
        <Button href="/login">{t('create-plan')}</Button>
      </div>
    </div>
  );
};

export default LoggedOutReadingStreak;
