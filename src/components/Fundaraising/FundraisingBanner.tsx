import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button, { ButtonType } from '../dls/Button/Button';

import styles from './FundraisingBanner.module.scss';

import { logEvent } from 'src/utils/eventLogger';

const FundraisingBanner = () => {
  const { t } = useTranslation('common');
  const onDonateClicked = () => {
    logEvent('donate_button_clicked', {
      source: 'sidebar_banner',
    });
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{t('fundraising.title')}</h1>
      <p className={styles.paragraph}>{t('fundraising.description')}</p>
      <Button
        onClick={onDonateClicked}
        isNewTab
        href="https://donate.quran.com"
        type={ButtonType.Warning}
        className={styles.cta}
      >
        {t('donate')}
      </Button>
      <div className={styles.backgroundImageContainer}>
        <MoonIllustrationSVG />
      </div>
    </div>
  );
};

export default FundraisingBanner;
