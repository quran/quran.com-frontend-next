import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { HeadlessService } from '@novu/headless';

import { getNotificationSubscriberHashCookie, getUserIdCookie } from '@/utils/auth/login';

const HeadlessServiceContext = createContext<{
  headlessService: HeadlessService;
  status: HeadlessServiceStatus;
  isReady: boolean;
}>(null);

export enum HeadlessServiceStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
}

export const HeadlessServiceProvider = ({ children }) => {
  const [status, setStatus] = useState<HeadlessServiceStatus>(HeadlessServiceStatus.INITIALIZING);

  const headlessService = useMemo(() => {
    return new HeadlessService({
      backendUrl: process.env.NEXT_PUBLIC_NOVU_BACKEND_URL,
      socketUrl: process.env.NEXT_PUBLIC_NOVU_SOCKET_URL,
      subscriberId: getUserIdCookie(),
      subscriberHash: getNotificationSubscriberHashCookie(),
      applicationIdentifier: process.env.NEXT_PUBLIC_NOVU_APP_ID,
    });
  }, []);

  useEffect(() => {
    headlessService.initializeSession({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      listener: () => {},
      onSuccess: () => {
        setStatus(HeadlessServiceStatus.READY);
      },
      onError: (error) => {
        setStatus(HeadlessServiceStatus.ERROR);
        console.log('headless error:', error);
      },
    });
  }, [headlessService]);

  const value = useMemo(
    () => ({ headlessService, status, isReady: status === HeadlessServiceStatus.READY }),
    [headlessService, status],
  );
  return (
    <HeadlessServiceContext.Provider value={value}>{children}</HeadlessServiceContext.Provider>
  );
};

export const useHeadlessService = () => useContext(HeadlessServiceContext);
