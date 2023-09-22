import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import NotificationItem from './NotificationItem';
import styles from './NotificationsList.module.scss';

import { useNotification } from '@/contexts/NotificationContext';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import Separator from '@/dls/Separator/Separator';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';

const NotificationsList = () => {
  const { t } = useTranslation('common');
  const {
    notifications,
    markNotificationsAsRead,
    markAllMessagesAsRead,
    deleteNotification,
    setPageNumber,
    fetchNotifications,
  } = useNotification();

  const onMarkAllAsReadClicked = () => {
    // TODO: add logging
    markAllMessagesAsRead();
  };

  const onPreviousPageClicked = () => {
    // TODO: add logging
    setPageNumber((prevPageNumber) => prevPageNumber - 1);
    fetchNotifications(true);
  };

  const onNextPageClicked = () => {
    // TODO: add logging
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
    fetchNotifications(true);
  };

  return (
    <div className={styles.bellContainer}>
      <div className={styles.header}>
        <p className={styles.title}>{t('notifications')}</p>
        <div className={styles.buttonsContainer}>
          <Button
            onClick={onPreviousPageClicked}
            type={ButtonType.Secondary}
            size={ButtonSize.Small}
            prefix={<ChevronLeftIcon />}
            tooltip={t('prev')}
          />
          <Button
            onClick={onNextPageClicked}
            size={ButtonSize.Small}
            type={ButtonType.Secondary}
            suffix={<ChevronRightIcon />}
            tooltip={t('next')}
          />
          <Button
            onClick={onMarkAllAsReadClicked}
            size={ButtonSize.Small}
            type={ButtonType.Secondary}
            tooltip={t('notification.mark-all-as-read')}
          >
            {t('notification.mark-all-as-read')}
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        {notifications.map((notification) => (
          <NotificationItem
            deleteNotification={deleteNotification}
            key={notification.id}
            notification={notification}
            markNotificationsAsRead={markNotificationsAsRead}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationsList;
