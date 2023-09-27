/* eslint-disable max-lines */
import { useContext, createContext, useMemo } from 'react';

import useDeleteNotification from './useDeleteNotification';
import useFetchNotifications from './useFetchNotifications';
import { HeadlessServiceProvider } from './useHeadlessService';
import useMarkAllAsRead from './useMarkAllAsRead';
import useMarkNotificationAsRead from './useMarkNotificationAsRead';
import useInitializeUnseenCount from './useUnseenCount';

type NotificationContextType = {
  fetchNotifications: ReturnType<typeof useFetchNotifications>;
  markAllAsRead: ReturnType<typeof useMarkAllAsRead>;
  deleteNotification: ReturnType<typeof useDeleteNotification>;
  markNotificationAsRead: ReturnType<typeof useMarkNotificationAsRead>;
};

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

const NotificationsProviderInner = ({ children }: { children: React.ReactNode }) => {
  // fetch initial unseen count and listen to its changes
  useInitializeUnseenCount();

  const fetchNotifications = useFetchNotifications();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const markNotificationAsRead = useMarkNotificationAsRead();

  const value = useMemo(
    () => ({
      fetchNotifications,
      markAllAsRead,
      deleteNotification,
      markNotificationAsRead,
    }),
    [fetchNotifications, markAllAsRead, deleteNotification, markNotificationAsRead],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// eslint-disable-next-line react/no-multi-comp
export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <HeadlessServiceProvider>
      <NotificationsProviderInner>{children}</NotificationsProviderInner>
    </HeadlessServiceProvider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
