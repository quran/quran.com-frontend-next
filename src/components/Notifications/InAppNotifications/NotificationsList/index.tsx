import React from 'react';

import type { IMessage } from '@novu/shared';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import { Virtuoso } from 'react-virtuoso';

import NotificationItem from './NotificationItem';
import styles from './NotificationsList.module.scss';

import Error from '@/components/Error';
import useMarkAllAsRead from '@/components/Notifications/hooks/useMarkAllAsRead';
import { useNotifications } from '@/components/Notifications/InAppNotifications/NotificationContext';
import Button, { ButtonSize, ButtonType } from '@/dls/Button/Button';
import Separator from '@/dls/Separator/Separator';
import Spinner from '@/dls/Spinner/Spinner';
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
  const { fetchNotifications } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();
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
    if (!hasMoreNotifications) return;
    fetchNotifications.fetch({
      page: lastPage + 1,
      shouldMarkAsSeenOnSuccess: true,
      shouldResetOldData: false,
    });
  };

  const onRetryClicked = () => {
    fetchNotifications.fetch({
      page: 1,
      shouldMarkAsSeenOnSuccess: true,
      shouldResetOldData: true,
    });
  };

  const renderNotificationItem = (index: number, notification: IMessage) => (
    // eslint-disable-next-line no-underscore-dangle
    <React.Fragment key={notification._id}>
      <NotificationItem notification={notification} />
      {index === notifications.length - 1 && isFetching ? <Spinner /> : null}
    </React.Fragment>
  );

  const renderList = () => {
    const hasError = !!fetchNotifications.error;

    if (hasError) {
      return <Error error={fetchNotifications.error as Error} onRetryClicked={onRetryClicked} />;
    }

    if (notifications.length > 0) {
      return (
        <Virtuoso
          data={notifications}
          overscan={10}
          increaseViewportBy={{ top: 10, bottom: 10 }}
          className={styles.notificationsList}
          endReached={loadMoreNotifications}
          itemContent={renderNotificationItem}
        />
      );
    }

    return (
      <div className={styles.emptyMessage}>{isLoading ? <Spinner /> : t('no-notifications')}</div>
    );
  };

  return (
    <div className={styles.notificationsContainer}>
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
      <div className={styles.listContainer}>{renderList()}</div>
    </div>
  );
};

export default NotificationsList;
