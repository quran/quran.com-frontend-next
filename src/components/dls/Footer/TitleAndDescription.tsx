import useTranslation from 'next-translate/useTranslation';

import styles from './Footer.module.scss';

import { QuranTextLogoIcon } from 'src/components/Icons';

const TitleAndDescription = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.titleAndDescriptionContainer}>
      <div className={styles.headingContainer}>
        <div className={styles.iconContainer}>
          <QuranTextLogoIcon />
        </div>
        <div className={styles.title}>{t('home:footer.title')}</div>
      </div>
      <p className={styles.description}>{t('footer.description')}</p>
    </div>
  );
};

export default TitleAndDescription;
