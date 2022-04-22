import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button, { ButtonType } from '../dls/Button/Button';
import Spinner from '../dls/Spinner/Spinner';

import styles from './FundraisingBanner.module.scss';

import { logEvent } from 'src/utils/eventLogger';

const FundraisingBanner = () => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const onDonateClicked = () => {
    // @ts-ignore
    window.givingloop('donate');

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    logEvent('donate_button_clicked', {
      source: 'sidebar_banner',
    });
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{t('fundraising.title')}</h1>
      <p className={styles.paragraph}>{t('fundraising.description')}</p>
      <Button
        // href="https://donate.quran.com"
        onClick={onDonateClicked}
        isNewTab
        type={ButtonType.Warning}
        className={styles.ctaContainer}
        gl-donate-button=""
        data-gl-monthly="false"
        data-gl-amount="100"
        key="become-monthly-donor"
      >
        {isLoading ? <Spinner /> : t('fundraising.cta')}
      </Button>
      <div className={styles.backgroundImageContainer}>
        <MoonIllustrationSVG />
      </div>
    </div>
  );
};

export default FundraisingBanner;
