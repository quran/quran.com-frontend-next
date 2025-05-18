import Trans from 'next-translate/Trans';
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
      <p className={styles.description}>
        <Trans
          i18nKey="common:footer.description"
          components={{
            br: <br />,
          }}
        />
      </p>
    </div>
  );
};

export default TitleAndDescription;
