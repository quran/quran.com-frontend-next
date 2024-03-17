import React, { useState } from 'react';

import type { IMessage } from '@novu/shared';
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './NotificationItem.module.scss';

import useDeleteNotification from '@/components/Notifications/hooks/useDeleteNotification';
import useMarkNotificationAsRead from '@/components/Notifications/hooks/useMarkNotificationAsRead';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import Spinner from '@/dls/Spinner/Spinner';
import CloseIcon from '@/icons/close.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import TickIcon from '@/icons/tick.svg';
import { formatDateRelatively } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  notification: IMessage;
};

const NotificationItem: React.FC<Props> = ({ notification }) => {
  const { t, lang } = useTranslation('common');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const markNotificationAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();

  const onMarkNotificationAsReadClicked = (notificationId: string) => {
    logButtonClick('notification_mark_as_read', { notificationId });
    markNotificationAsRead.mutate(notificationId);
    setIsPopoverOpen(false);
  };

  const onDeletedNotificationClicked = (notificationId: string) => {
    logButtonClick('notification_delete', { notificationId });
    deleteNotification.mutate(notificationId);
  };

  const onOpenChange = (open: boolean) => {
    logButtonClick('notification_more', {
      // eslint-disable-next-line no-underscore-dangle
      notificationId: notification._id,
      open,
    });
    setIsPopoverOpen(open);
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
        <p>{notification?.content as string}</p>
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
            isOpen={isPopoverOpen}
            isPortalled={false}
            onOpenChange={onOpenChange}
          >
            {isNotRead && (
              <PopoverMenu.Item
                // eslint-disable-next-line no-underscore-dangle
                onClick={() => onMarkNotificationAsReadClicked(notification?._id)}
                icon={markNotificationAsRead.isMutating ? <Spinner /> : <TickIcon />}
                isDisabled={markNotificationAsRead.isMutating}
                className={styles.tickIcon}
              >
                {t('notification.mark-as-read')}
              </PopoverMenu.Item>
            )}

            <PopoverMenu.Item
              // eslint-disable-next-line no-underscore-dangle
              onClick={() => onDeletedNotificationClicked(notification?._id)}
              icon={deleteNotification.isMutating ? <Spinner /> : <CloseIcon />}
              isDisabled={deleteNotification.isMutating}
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
