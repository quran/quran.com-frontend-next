import React from 'react';

import classNames from 'classnames';
import capitalize from 'lodash/capitalize';
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

interface SocialButton {
  name: 'whatsapp' | 'telegram';
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

// NOTE: The 'name' property must match CSS class names in QuranicCalendarHero.module.scss
// (e.g., name 'whatsapp' → .joinWhatsappText, .joinWhatsappMobileText)
const SOCIAL_BUTTONS: SocialButton[] = [
  {
    name: 'whatsapp',
    icon: WhatsappIcon,
    url: WHATSAPP_CHANNEL_URL,
    eventKey: 'quranic_calendar_join_whatsapp',
  },
  {
    name: 'telegram',
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

          <span className={classNames({ [styles.subscribeText]: isSubscribed })}>
            {isSubscribed ? t('common:subscribed') : t('common:subscribe')}
          </span>
        </Button>

        {showAskQuestionButton && (
          <Button
            {...SUCCESS_PILL_BUTTON_PROPS}
            href={ASK_QUESTION_FORM_URL}
            isNewTab
            onClick={() => logButtonClick('quran_calendar_ask_question')}
            className={classNames(styles.button, styles.askQuestionButton)}
          >
            <IconContainer {...ICON_CONTAINER_PROPS} icon={<QuestionMarkIcon />} />
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
            <span className={styles[`join${capitalize(name)}Text`]}>{t(`join-${name}`)}</span>
            <span className={styles[`join${capitalize(name)}MobileText`]}>
              {t(`join-${name}-mobile`)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;
