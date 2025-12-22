import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './QuranicCalendarHero.module.scss';

import Button, { ButtonShape, ButtonType } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner from '@/dls/Spinner/Spinner';
import AskQuestionIcon from '@/icons/ask-question.svg';
import EmailIcon from '@/icons/email.svg';
import TelegramIcon from '@/icons/telegram.svg';
import TickIcon from '@/icons/tick.svg';
import WhatsappIcon from '@/icons/whatsapp.svg';
import { logButtonClick } from '@/utils/eventLogger';
import {
  ASK_QUESTION_FORM_URL,
  TELEGRAM_CHANNEL_URL,
  WHATSAPP_CHANNEL_URL,
} from '@/utils/externalLinks';

interface ActionButtonsProps {
  isSubscribed: boolean;
  isSubscriptionLoading: boolean;
  isEnrolling: boolean;
  onEnrollButtonClicked: () => void;
  isLoggedIn?: boolean;
}

enum SocialButtonName {
  Whatsapp = 'whatsapp',
  Telegram = 'telegram',
}

interface SocialButton {
  name: SocialButtonName;
  icon: React.ComponentType;
  url: string;
  eventKey: string;
}

const SUCCESS_PILL_BUTTON_PROPS = {
  type: ButtonType.Success,
  shape: ButtonShape.Pill,
};

const ICON_CONTAINER_PROPS = {
  className: styles.iconContainer,
  size: IconSize.Small,
  shouldFlipOnRTL: true,
  shouldForceSetColors: false,
};

const SOCIAL_BUTTONS: SocialButton[] = [
  {
    name: SocialButtonName.Whatsapp,
    icon: WhatsappIcon,
    url: WHATSAPP_CHANNEL_URL,
    eventKey: 'quranic_calendar_join_whatsapp',
  },
  {
    name: SocialButtonName.Telegram,
    icon: TelegramIcon,
    url: TELEGRAM_CHANNEL_URL,
    eventKey: 'quranic_calendar_join_telegram',
  },
];

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

  const showAskQuestionButton = isLoggedIn && isSubscribed;

  return (
    <div className={styles.buttonContainer}>
      <div className={styles.subscribeButtonsGroup}>
        <Button
          {...SUCCESS_PILL_BUTTON_PROPS}
          onClick={onEnrollButtonClicked}
          isDisabled={isEnrolling}
          className={classNames(styles.subscribeButton, {
            [styles.subscribeButtonSmall]: showAskQuestionButton,
          })}
        >
          <IconContainer
            {...ICON_CONTAINER_PROPS}
            icon={subscribeButtonIcon(isSubscriptionLoading || isEnrolling, isSubscribed)}
          />

          <span
            className={classNames({
              [styles.subscribeText]: isSubscribed,
            })}
          >
            {isSubscribed ? t('common:subscribed') : t('common:subscribe')}
          </span>
        </Button>

        {showAskQuestionButton && (
          <Button
            {...SUCCESS_PILL_BUTTON_PROPS}
            href={ASK_QUESTION_FORM_URL}
            isNewTab
            onClick={() => logButtonClick('quranic_calendar_ask_question')}
            className={classNames(styles.button, styles.askQuestionButton)}
          >
            <IconContainer {...ICON_CONTAINER_PROPS} icon={<AskQuestionIcon />} />
            {t('ask-question')}
          </Button>
        )}
      </div>

      <div className={styles.socialButtonsGroup}>
        {SOCIAL_BUTTONS.map(({ name, icon: Icon, url, eventKey }) => (
          <Button
            {...SUCCESS_PILL_BUTTON_PROPS}
            key={name}
            href={url}
            isNewTab
            onClick={() => logButtonClick(eventKey)}
            className={styles.button}
          >
            <IconContainer {...ICON_CONTAINER_PROPS} icon={<Icon />} />
            <span className={styles.joinSocialText}>{t(`join-${name}`)}</span>
            <span className={styles.joinSocialMobileText}>{t(`join-${name}-mobile`)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;
