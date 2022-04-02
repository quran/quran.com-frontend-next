import useTranslation from 'next-translate/useTranslation';

import TrophySVG from '../../../public/images/trophy.svg';
import Button, { ButtonType } from '../dls/Button/Button';

import styles from './FundraisingBanner.module.scss';

const FundraisingBanner = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{t('fundraising.title')}</h1>
      <p className={styles.paragraph}>{t('fundraising.description')}</p>
      <Button type={ButtonType.Success} className={styles.ctaContainer}>
        {t('fundraising.cta')}
      </Button>
      <div className={styles.backgroundImageContainer}>
        <TrophySVG />
      </div>
    </div>
  );
};

export default FundraisingBanner;
