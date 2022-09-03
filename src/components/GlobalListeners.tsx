import React from 'react';

import GlobalKeyboardListeners from '@/components/GlobalKeyboardListeners';
import GlobalScrollListener from '@/components/GlobalScrollListener';

const GlobalListeners = () => {
  return (
    <>
      <GlobalKeyboardListeners />
      <GlobalScrollListener />
    </>
  );
};

export default GlobalListeners;
