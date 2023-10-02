import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { HeadlessService } from '@novu/headless';

import { logErrorToSentry } from '@/lib/sentry';
import { getNotificationSubscriberHashCookie, getUserIdCookie } from '@/utils/auth/login';

const HeadlessServiceContext = createContext<{
  headlessService: HeadlessService;
  status: HeadlessServiceStatus;
  isReady: boolean;
  error: unknown | null;
}>(null);

export enum HeadlessServiceStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  ERROR = 'error',
}

export const HeadlessServiceProvider = ({ children }) => {
  const [status, setStatus] = useState<HeadlessServiceStatus>(HeadlessServiceStatus.INITIALIZING);
  const [error, setError] = useState<unknown | null>(null);

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
      onError: (err) => {
        setError(err);
        setStatus(HeadlessServiceStatus.ERROR);
        logErrorToSentry(err, { transactionName: 'useHeadlessService' });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headlessService]);

  const value = useMemo(
    () => ({ headlessService, status, isReady: status === HeadlessServiceStatus.READY, error }),
    [headlessService, status, error],
  );

  return (
    <HeadlessServiceContext.Provider value={value}>{children}</HeadlessServiceContext.Provider>
  );
};

export const useHeadlessService = () => useContext(HeadlessServiceContext);
