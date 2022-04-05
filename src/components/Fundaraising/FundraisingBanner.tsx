import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button, { ButtonType } from '../dls/Button/Button';

import styles from './FundraisingBanner.module.scss';

import { logButtonClick } from 'src/utils/eventLogger';

const FundraisingBanner = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{t('fundraising.title')}</h1>
      <p className={styles.paragraph}>{t('fundraising.description')}</p>
      <Button
        href="https://donate.quran.com"
        onClick={() => logButtonClick('fundraising_sidebar')}
        isNewTab
        type={ButtonType.Success}
        className={styles.ctaContainer}
      >
        {t('fundraising.cta')}
      </Button>
      <div className={styles.backgroundImageContainer}>
        <MoonIllustrationSVG />
      </div>
    </div>
  );
};

export default FundraisingBanner;
