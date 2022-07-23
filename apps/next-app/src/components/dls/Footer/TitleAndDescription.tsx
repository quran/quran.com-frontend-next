import useTranslation from 'next-translate/useTranslation';

import QuranText from 'src/components/Icons/QuranText/QuranText';

import styles from './Footer.module.scss';

const TitleAndDescription = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.titleAndDescriptionContainer}>
      <div className={styles.headingContainer}>
        <div className={styles.iconContainer}>
          <QuranText />
        </div>
        <div className={styles.title}>{t('footer.title')}</div>
      </div>
      <p className={styles.description}>{t('footer.description')}</p>
    </div>
  );
};

export default TitleAndDescription;
