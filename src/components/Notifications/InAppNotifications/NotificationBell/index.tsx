import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NotificationBell.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import NotificationBellIcon from '@/icons/notification-bell.svg';
import { toLocalizedNumber } from '@/utils/locale';

type Props = {
  onBellClicked: () => void;
  unseenNotificationsCount: number;
};

const MAX_NOTIFICATIONS_COUNT = 9;

const NotificationBell: React.FC<Props> = ({ onBellClicked, unseenNotificationsCount }) => {
  const { t, lang } = useTranslation('common');

  let count = null;
  if (unseenNotificationsCount > 0) {
    count =
      unseenNotificationsCount > MAX_NOTIFICATIONS_COUNT
        ? `${toLocalizedNumber(MAX_NOTIFICATIONS_COUNT, lang)}+`
        : toLocalizedNumber(unseenNotificationsCount, lang);
  }

  return (
    <Button
      tooltip={t('notifications')}
      shape={ButtonShape.Circle}
      variant={ButtonVariant.Ghost}
      ariaLabel={t('aria.select-lng')}
      onClick={onBellClicked}
    >
      <NotificationBellIcon />

      {count && (
        <div className={styles.count}>
          <p className={styles.countText}>{count}</p>
        </div>
      )}
    </Button>
  );
};

export default NotificationBell;
