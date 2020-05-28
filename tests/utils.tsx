import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme as themeObj } from '../src/utils/styles';

function render(ui, { theme = themeObj, ...options } = {}) {
    function Wrapper({ children }) {
        return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
    }

    return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { render };
