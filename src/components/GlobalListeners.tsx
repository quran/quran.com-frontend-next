import React from 'react';

import DisableAnimationsUntilHydration from './DisableAnimationsUntilHydration';
import GlobalPersistGateHydrationListener from './GlobalPersistGateHydrationListener';

import GlobalKeyboardListeners from '@/components/GlobalKeyboardListeners';
import GlobalScrollListener from '@/components/GlobalScrollListener';

const GlobalListeners = () => {
  return (
    <>
      <GlobalKeyboardListeners />
      <GlobalScrollListener />
      <GlobalPersistGateHydrationListener />
      <DisableAnimationsUntilHydration />
    </>
  );
};

export default GlobalListeners;
