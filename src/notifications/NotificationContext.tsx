/* eslint-disable max-lines */
import { useContext, createContext, useMemo } from 'react';

import useFetchNotifications from './useFetchNotifications';
import { HeadlessServiceProvider } from './useHeadlessService';
import useInitializeUnseenCount from './useInitializeUnseenCount';

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
