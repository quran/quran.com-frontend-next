import React from 'react';

import { useSelector } from 'react-redux';

import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import isClient from '@/utils/isClient';

// This utility disables all animations until the redux-persist store hydration is complete.
// This is done to prevent a bunch of animations from happening on initial page load.
const DisableAnimationsUntilHydration = () => {
  const isPersistGateHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);

  if (isClient && !isPersistGateHydrationComplete) {
    return (
      <style>
        {`
          * {
            transition: all 0s !important;
          }
        `}
      </style>
    );
  }

  return <></>;
};

export default DisableAnimationsUntilHydration;
