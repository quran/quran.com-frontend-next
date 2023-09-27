import { useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';

import { HeadlessServiceStatus, useHeadlessService } from './useHeadlessService';

import { setUnseenCount } from '@/redux/slices/notifications';

const useInitializeUnseenCount = () => {
  const { headlessService, status } = useHeadlessService();
  const [error, setError] = useState<unknown>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === HeadlessServiceStatus.READY) {
      headlessService.fetchUnseenCount({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        listener: () => {},
        onSuccess: ({ count }) => {
          dispatch({ type: setUnseenCount.type, payload: count });
          setError(null);
        },
        onError: (err: unknown) => {
          setError(err);
        },
      });

      headlessService.listenUnseenCountChange({
        listener: (count) => {
          dispatch({ type: setUnseenCount.type, payload: count });
        },
      });
    }
  }, [headlessService, status, dispatch]);

  return { error };
};

export default useInitializeUnseenCount;
