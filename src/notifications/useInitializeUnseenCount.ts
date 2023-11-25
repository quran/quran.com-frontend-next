import { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';

import { useHeadlessService } from './useHeadlessService';

import { logErrorToSentry } from '@/lib/sentry';
import { setUnseenCount } from '@/redux/slices/notifications';

const useInitializeUnseenCount = () => {
  const { headlessService, isReady } = useHeadlessService();
  const [error, setError] = useState<unknown>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isReady) {
      headlessService.fetchUnseenCount({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        listener: () => {},
        onSuccess: ({ count }) => {
          dispatch({ type: setUnseenCount.type, payload: count });
          setError(null);
        },
        onError: (err: unknown) => {
          setError(err);
          logErrorToSentry(err, { transactionName: 'useInitializeUnseenCount' });
        },
      });

      headlessService.listenUnseenCountChange({
        listener: (count) => {
          dispatch({ type: setUnseenCount.type, payload: count });
        },
      });
    }
  }, [headlessService, isReady, dispatch]);

  return { error };
};

export default useInitializeUnseenCount;
