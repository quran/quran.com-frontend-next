import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NotificationBell.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import GlobeIcon from '@/icons/notification-bell.svg';
import { toLocalizedNumber } from '@/utils/locale';

type Props = {
  onBellClicked: () => void;
  unseenNotificationsCount: number;
};

const NotificationBell: React.FC<Props> = ({ onBellClicked, unseenNotificationsCount }) => {
  const { t, lang } = useTranslation('common');
  let count = null;
  if (unseenNotificationsCount > 0) {
    count =
      unseenNotificationsCount > 9
        ? `${toLocalizedNumber(9, lang)}+`
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
      <GlobeIcon />
      {count && (
        <div className={styles.count}>
          <p className={styles.countText}>{count}</p>
        </div>
      )}
    </Button>
  );
};

export default NotificationBell;
