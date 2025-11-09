import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './QuranicCalendarHero.module.scss';

import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner from '@/dls/Spinner/Spinner';
import EmailIcon from '@/icons/email.svg';
import QuestionMarkIcon from '@/icons/question-mark.svg';
import TelegramIcon from '@/icons/telegram.svg';
import TickIcon from '@/icons/tick.svg';
import WhatsappIcon from '@/icons/whatsapp.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface ActionButtonsProps {
  isSubscribed: boolean;
  isSubscriptionLoading: boolean;
  isEnrolling: boolean;
  onEnrollButtonClicked: () => void;
  isLoggedIn?: boolean;
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
  isLoggedIn = false,
}) => {
  const { t } = useTranslation('quranic-calendar');

  const onJoinWhatsapp = () => {
    logButtonClick('quranic_calendar_join_whatsapp');
  };

  const onJoinTelegram = () => {
    logButtonClick('quranic_calendar_join_telegram');
  };

  const handleAskQuestionClick = () => {
    logButtonClick('quran_calendar_ask_question');

    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLSdVxKk4WtikWCIYcfvFdXy3TFcRCUB2zDEddSyKjFukDwTvzA/viewform',
      '_blank',
    );
  };

  const showAskQuestionButton = isLoggedIn && isSubscribed;

  return (
    <div className={styles.buttonContainer}>
      <div className={styles.subscribeButtonsGroup}>
        <Button
          onClick={onEnrollButtonClicked}
          type={ButtonType.Success}
          shape={ButtonShape.Pill}
          isDisabled={isEnrolling}
          className={classNames(styles.subscribeButton, {
            [styles.subscribeButtonSmall]: showAskQuestionButton,
          })}
        >
          <IconContainer
            className={styles.iconContainer}
            size={IconSize.Small}
            shouldFlipOnRTL
            shouldForceSetColors={false}
            icon={subscribeButtonIcon(isSubscriptionLoading || isEnrolling, isSubscribed)}
          />

          <span className={isSubscribed ? styles.subscribeText : undefined}>
            {isSubscribed ? t('common:subscribed') : t('common:subscribe')}
          </span>
        </Button>

        {showAskQuestionButton && (
          <Button
            onClick={handleAskQuestionClick}
            type={ButtonType.Success}
            shape={ButtonShape.Pill}
            className={styles.button}
          >
            <IconContainer
              className={styles.iconContainer}
              size={IconSize.Small}
              shouldFlipOnRTL
              shouldForceSetColors={false}
              icon={<QuestionMarkIcon />}
            />
            {t('ask-question')}
          </Button>
        )}
      </div>

      <div className={styles.socialButtonsGroup}>
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
          <span className={styles.joinWhatsappText}>{t('join-whatsapp')}</span>
          <span className={styles.joinWhatsappMobileText}>{t('join-whatsapp-mobile')}</span>
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
          <span className={styles.joinTelegramText}>{t('join-telegram')}</span>
          <span className={styles.joinTelegramMobileText}>{t('join-telegram-mobile')}</span>
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
