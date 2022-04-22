import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

// import useTranslation from 'next-translate/useTranslation';

// import CloseIcon from '../../../public/icons/close.svg';
// import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';

import Button, { ButtonVariant } from '../dls/Button/Button';
import Spinner from '../dls/Spinner/Spinner';

import styles from './HomePageMessage.module.scss';

import { logEvent } from 'src/utils/eventLogger';

type HomePageMessageProps = {
  title?: string;
  subtitle?: string;
  body?: React.ReactNode;
  onClose?: () => void;
};

const HomePageMessage = ({ title, subtitle, body }: HomePageMessageProps) => {
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
      source: 'cta_welcome_message',
    });
  };
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{subtitle}</p>
      {body}

      {/* <div className={styles.closeIcon}>
        <Button
          size={ButtonSize.Small}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Ghost}
          onClick={onClose}
          ariaLabel={t('aria.msg-close')}
        >
          <CloseIcon />
        </Button>
      </div> */}
      <div className={styles.ctaContainer}>
        <Button
          isNewTab
          // href="https://donate.quran.com"
          onClick={onDonateClicked}
          className={styles.ctaPrimary}
          gl-donate-button=""
          data-gl-monthly="false"
          data-gl-amount="100"
          key="become-monthly-donor"
        >
          {isLoading ? <Spinner /> : t('fundraising-sticky-banner.cta')}
        </Button>

        <Button
          isNewTab
          href="https://donate.quran.com"
          onClick={() => {
            logEvent('donate_button_clicked', {
              source: 'learn_more_welcome_message',
            });
          }}
          className={styles.ctaSecondary}
          variant={ButtonVariant.Compact}
        >
          {t('fundraising.learn-more')}
        </Button>
      </div>
    </div>
  );
};

export default HomePageMessage;
