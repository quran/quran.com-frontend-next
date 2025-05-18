import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './QuranicCalendarHero.module.scss';

import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner from '@/dls/Spinner/Spinner';
import EmailIcon from '@/icons/email.svg';
import TelegramIcon from '@/icons/telegram.svg';
import TickIcon from '@/icons/tick.svg';
import WhatsappIcon from '@/icons/whatsapp.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { isMobile } from '@/utils/responsive';

interface ActionButtonsProps {
  isSubscribed: boolean;
  isSubscriptionLoading: boolean;
  isEnrolling: boolean;
  onEnrollButtonClicked: () => void;
}

const subscribeButtonIcon = (isLoading: boolean, isSubscribed: boolean) => {
  if (isLoading) {
    return <Spinner />;
  }
  if (isSubscribed) {
    return <TickIcon />;
  }
  return <EmailIcon />;
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSubscribed,
  isSubscriptionLoading,
  isEnrolling,
  onEnrollButtonClicked,
}) => {
  const { t } = useTranslation('quranic-calendar');

  const onJoinWhatsapp = () => {
    logButtonClick('quranic_calendar_join_whatsapp');
  };

  const onJoinTelegram = () => {
    logButtonClick('quranic_calendar_join_telegram');
  };

  const isMobileBrowser = isMobile();

  const socialButtons = (
    <>
      <Button
        onClick={onJoinWhatsapp}
        className={styles.button}
        type={ButtonType.Success}
        shape={ButtonShape.Pill}
        href="https://whatsapp.com/channel/0029Vb8w7pTIt5rnEhqy1u1u"
      >
        <IconContainer
          className={styles.iconContainer}
          size={IconSize.Small}
          shouldForceSetColors={false}
          icon={<WhatsappIcon />}
        />
        {isMobileBrowser ? t('join-whatsapp-mobile') : t('join-whatsapp')}
      </Button>
      <Button
        onClick={onJoinTelegram}
        className={styles.button}
        type={ButtonType.Success}
        shape={ButtonShape.Pill}
        href="https://t.me/QuranInaYear"
      >
        <IconContainer
          className={styles.iconContainer}
          size={IconSize.Small}
          shouldForceSetColors={false}
          icon={<TelegramIcon />}
        />
        {isMobileBrowser ? t('join-telegram-mobile') : t('join-telegram')}
      </Button>
    </>
  );

  return (
    <div className={styles.buttonContainer}>
      <Button
        onClick={onEnrollButtonClicked}
        type={ButtonType.Success}
        shape={ButtonShape.Pill}
        isDisabled={isEnrolling}
        className={isMobile() ? styles.subscribeButton : ''}
      >
        <IconContainer
          className={styles.iconContainer}
          size={IconSize.Small}
          shouldFlipOnRTL
          shouldForceSetColors={false}
          icon={subscribeButtonIcon(isSubscriptionLoading || isEnrolling, isSubscribed)}
        />
        {isSubscribed ? t('common:subscribed') : t('common:subscribe')}
      </Button>
      {isMobile() ? (
        <div className={styles.socialButtonsContainer}>{socialButtons}</div>
      ) : (
        socialButtons
      )}
    </div>
  );
};

export default ActionButtons;
