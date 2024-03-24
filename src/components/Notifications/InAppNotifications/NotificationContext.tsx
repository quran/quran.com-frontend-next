/* eslint-disable max-lines */
import { useContext, createContext, useMemo } from 'react';

import useFetchNotifications from '@/components/Notifications/hooks/useFetchNotifications';
import { HeadlessServiceProvider } from '@/components/Notifications/hooks/useHeadlessService';
import useInitializeUnseenCount from '@/components/Notifications/hooks/useInitializeUnseenCount';

type NotificationContextType = {
  fetchNotifications: ReturnType<typeof useFetchNotifications>;
};

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

const NotificationsProviderInner = ({ children }: { children: React.ReactNode }) => {
  // fetch initial unseen count and listen to its changes
  useInitializeUnseenCount();

  const fetchNotifications = useFetchNotifications();

  const value = useMemo(
    () => ({
      fetchNotifications,
    }),
    [fetchNotifications],
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
