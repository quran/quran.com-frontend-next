import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import { Virtuoso } from 'react-virtuoso';

import NotificationItem from './NotificationItem';
import styles from './NotificationsList.module.scss';

import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import Separator from '@/dls/Separator/Separator';
import Spinner from '@/dls/Spinner/Spinner';
import { useNotifications } from '@/notifications/NotificationContext';
import {
  selectHasMoreNotifications,
  selectLastLoadedNotificationsPage,
  selectNotifications,
  selectNotificationsIsFetching,
  selectNotificationsIsLoading,
} from '@/redux/slices/notifications';
import { areArraysEqual } from '@/utils/array';
import { logButtonClick } from '@/utils/eventLogger';

const NotificationsList = () => {
  const { t } = useTranslation('common');
  const { markAllAsRead, fetchNotifications } = useNotifications();
  const notifications = useSelector(selectNotifications, areArraysEqual);
  const hasMoreNotifications = useSelector(selectHasMoreNotifications);
  const lastPage = useSelector(selectLastLoadedNotificationsPage);

  const isLoading = useSelector(selectNotificationsIsLoading);
  const isFetching = useSelector(selectNotificationsIsFetching);

  const onMarkAllAsReadClicked = () => {
    logButtonClick('notification_mark_all_as_read');
    markAllAsRead.mutate();
  };

  const loadMoreNotifications = () => {
    console.log({ hasMoreNotifications, lastPage });

    if (!hasMoreNotifications) return;
    fetchNotifications.fetch({
      page: lastPage + 1,
      shouldMarkAsSeenOnSuccess: false,
    });
  };

  return (
    <div className={styles.bellContainer}>
      <div className={styles.header}>
        <p className={styles.title}>{t('notifications')}</p>
        <div className={styles.buttonsContainer}>
          <Button
            onClick={onMarkAllAsReadClicked}
            size={ButtonSize.Small}
            type={ButtonType.Secondary}
            isLoading={markAllAsRead.isMutating}
          >
            {t('notification.mark-all-as-read')}
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        {notifications.length > 0 ? (
          <Virtuoso
            data={notifications}
            overscan={100}
            className={styles.notificationsList}
            endReached={loadMoreNotifications}
            itemContent={(index, notification) => (
              // eslint-disable-next-line no-underscore-dangle
              <React.Fragment key={notification._id}>
                <NotificationItem notification={notification} />
                {index === notifications.length - 1 && isFetching ? <Spinner /> : null}
              </React.Fragment>
            )}
          />
        ) : (
          <div className={styles.emptyMessage}>
            {isLoading ? <Spinner /> : t('no-notifications')}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
