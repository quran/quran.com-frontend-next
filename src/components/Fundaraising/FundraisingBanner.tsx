import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';
import Button, { ButtonType, ButtonVariant } from '../dls/Button/Button';

import styles from './FundraisingBanner.module.scss';

import { logEvent } from 'src/utils/eventLogger';
import openGivingLoopPopup from 'src/utils/givingloop';

const FundraisingBanner = () => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const onDonateClicked = () => {
    openGivingLoopPopup();
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
        onClick={onDonateClicked}
        isNewTab
        type={ButtonType.Warning}
        className={styles.cta}
        isLoading={isLoading}
      >
        {t('donate')}
      </Button>
      <Button
        href="https://donate.quran.com"
        isNewTab
        type={ButtonType.Warning}
        className={styles.cta}
        variant={ButtonVariant.Outlined}
      >
        {t('fundraising.learn-more')}
      </Button>
      <div className={styles.backgroundImageContainer}>
        <MoonIllustrationSVG />
      </div>
    </div>
  );
};

export default FundraisingBanner;
