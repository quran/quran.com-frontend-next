import React from 'react';

import GeoLocationPermissionListener from './GeoLocationPermissionListener';

import GlobalKeyboardListeners from 'src/components/GlobalKeyboardListeners';
import GlobalScrollListener from 'src/components/GlobalScrollListener';

const GlobalListeners = () => {
  return (
    <>
      <GlobalKeyboardListeners />
      <GlobalScrollListener />
      <GeoLocationPermissionListener />
    </>
  );
};

export default GlobalListeners;
