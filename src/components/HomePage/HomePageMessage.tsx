import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

// import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';

import styles from './HomePageMessage.module.scss';

import CloseIcon from '@/icons/close.svg';
import { logEvent } from 'src/utils/eventLogger';
import openGivingLoopPopup from 'src/utils/givingloop';

type HomePageMessageProps = {
  title?: string;
  subtitle?: string;
  body?: React.ReactNode;
  onClose?: () => void;
};

const HomePageMessage = ({
  // title, subtitle,
  body,
  onClose,
}: HomePageMessageProps) => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const onDonateClicked = () => {
    openGivingLoopPopup();
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
      <div>
        {/* <h3 className={styles.title}>{title}</h3> */}
        {/* <p className={styles.description}>{subtitle}</p> */}
        {body}
      </div>

      <div className={styles.ctaContainer}>
        <Button
          isLoading={isLoading}
          isNewTab
          onClick={onDonateClicked}
          className={styles.ctaPrimary}
        >
          {t('fundraising-sticky-banner.cta')}
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
          variant={ButtonVariant.Outlined}
        >
          {t('fundraising.learn-more')}
        </Button>
        <div className={styles.closeIcon}>
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Compact}
            shape={ButtonShape.Circle}
            onClick={onClose}
            ariaLabel={t('aria.msg-close')}
          >
            <CloseIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePageMessage;
