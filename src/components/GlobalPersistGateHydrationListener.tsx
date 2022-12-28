import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
  selectIsPersistGateHydrationInProgress,
  setIsPersistGateHydrationComplete,
  setIsPersistGateHydrationInProgress,
} from '@/redux/slices/persistGateHydration';

const PERSIST_GATE_HYDRATION_DURATION_MS = 50; // This number is mostly arbitrary. Long enough to ensure that the hydration is complete.

// This component listens to the REHYDRATE event from redux persist
// and dispatches an action to set the hydration as complete.
// The component works by setting a timeout to fire after the REHYDRATE event.
// Because the redux store is synchronous, there's no way to ensure the order of actions.
// So we have to use a timeout to ensure that the hydration complete event happens *after* REHYDRATE.
const GlobalPersistGateHydrationListener = () => {
  const dispatch = useDispatch();
  const isPersistGateHydrationInProgress = useSelector(selectIsPersistGateHydrationInProgress);

  useEffect(() => {
    if (isPersistGateHydrationInProgress) {
      setTimeout(() => {
        dispatch({ type: setIsPersistGateHydrationComplete.type, payload: true });
        dispatch({ type: setIsPersistGateHydrationInProgress.type, payload: false });
      }, PERSIST_GATE_HYDRATION_DURATION_MS);
    }
  }, [dispatch, isPersistGateHydrationInProgress]);
  return <></>;
};

export default GlobalPersistGateHydrationListener;
