import React from 'react';

import { render as rtlRender } from '@testing-library/react';

function render(ui, { ...options } = {}) {
  function Wrapper({ children }) {
    return <>{children}</>;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { render };
