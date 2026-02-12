import React from 'react';

import DisableAnimationsUntilHydration from './DisableAnimationsUntilHydration';
import GlobalPersistGateHydrationListener from './GlobalPersistGateHydrationListener';

import GlobalKeyboardListeners from '@/components/GlobalKeyboardListeners';
import GlobalScrollListener from '@/components/GlobalScrollListener';
import GuestBookmarksMigrationModal from '@/components/GuestBookmarksMigrationModal';
import useBookmarksBroadcastListener from '@/hooks/useBookmarksBroadcast';

const GlobalListeners = () => {
  useBookmarksBroadcastListener();

  return (
    <>
      <GlobalKeyboardListeners />
      <GlobalScrollListener />
      <GlobalPersistGateHydrationListener />
      <DisableAnimationsUntilHydration />
      <GuestBookmarksMigrationModal />
    </>
  );
};

export default GlobalListeners;
