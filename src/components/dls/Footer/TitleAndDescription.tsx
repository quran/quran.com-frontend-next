import useTranslation from 'next-translate/useTranslation';

import styles from './Footer.module.scss';

import QuranTextLogo from '@/icons/quran-text-logo.svg';

const TitleAndDescription = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.titleAndDescriptionContainer}>
      <div className={styles.headingContainer}>
        <div className={styles.iconContainer}>
          <QuranTextLogo />
        </div>
        <div className={styles.title}>{t('footer.title')}</div>
      </div>
      <p className={styles.description}>{t('footer.description')}</p>
    </div>
  );
};

export default TitleAndDescription;
