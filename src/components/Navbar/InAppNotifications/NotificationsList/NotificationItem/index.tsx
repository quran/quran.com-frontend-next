import React from 'react';

import { IMessageId } from '@novu/headless';
import type { IMessage } from '@novu/shared';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './NotificationItem.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import CloseIcon from '@/icons/close.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import TickIcon from '@/icons/tick.svg';
import { formatDateRelatively } from '@/utils/datetime';

type Props = {
  notification: IMessage;
  markNotificationsAsRead: (messageId: IMessageId) => void;
  deleteNotification: (messageId: IMessageId) => void;
};

const NotificationItem: React.FC<Props> = ({
  notification,
  markNotificationsAsRead,
  deleteNotification,
}) => {
  const { t, lang } = useTranslation('common');

  const onMarkNotificationAsReadClicked = (notificationId: string) => {
    // TODO: add logging
    markNotificationsAsRead(notificationId);
  };

  const onDeletedNotificationClicked = (notificationId: string) => {
    // TODO: add logging
    deleteNotification(notificationId);
  };

  const onOpenChange = (open: boolean) => {
    // TODO: add logging
  };

  const isNotRead = !notification?.read;

  const formattedDate = formatDateRelatively(new Date(notification.createdAt), lang);

  return (
    <div
      className={classNames(styles.container, {
        [styles.readText]: notification.read,
      })}
    >
      <div className={styles.individualNotif}>
        <p>{notification?.content}</p>
        <div className={styles.popoverContainer}>
          {/* eslint-disable-next-line i18next/no-literal-string */}
          {isNotRead && <p className={styles.dot}>&#x2022;</p>}
          <PopoverMenu
            trigger={
              <Button
                size={ButtonSize.Small}
                tooltip={t('more')}
                variant={ButtonVariant.Ghost}
                shape={ButtonShape.Circle}
                ariaLabel={t('more')}
              >
                <OverflowMenuIcon />
              </Button>
            }
            isModal={false}
            isPortalled={false}
            onOpenChange={onOpenChange}
          >
            {isNotRead && (
              <PopoverMenu.Item
                onClick={() => onMarkNotificationAsReadClicked(notification?.id)}
                icon={<TickIcon />}
                className={styles.tickIcon}
              >
                {t('notification.mark-as-read')}
              </PopoverMenu.Item>
            )}
            <PopoverMenu.Item
              onClick={() => onDeletedNotificationClicked(notification?.id)}
              icon={<CloseIcon />}
            >
              {t('remove')}
            </PopoverMenu.Item>
          </PopoverMenu>
        </div>
      </div>
      <p className={styles.date}>{formattedDate}</p>
    </div>
  );
};

export default NotificationItem;
