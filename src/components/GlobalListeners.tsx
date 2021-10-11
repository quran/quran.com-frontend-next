import React from 'react';

import GlobalKeyboardListeners from 'src/components/GlobalKeyboardListeners';
import GlobalScrollListener from 'src/components/GlobalScrollListener';

const GlobalListeners = () => {
  return (
    <>
      <GlobalKeyboardListeners />
      <GlobalScrollListener />
    </>
  );
};

export default GlobalListeners;
