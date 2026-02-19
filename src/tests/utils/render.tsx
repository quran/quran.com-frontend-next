import { type ReactElement, useMemo } from 'react';

import { DirectionProvider } from '@radix-ui/react-direction';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';

import { makeStore, type TestStore } from './redux';

import DataContext from '@/contexts/DataContext';
import type { RootState } from '@/redux/RootState';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: TestStore;
  direction?: 'ltr' | 'rtl';
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {} as Partial<RootState>,
    store = makeStore(preloadedState),
    direction = 'ltr',
    ...options
  }: Options = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const emptyChaptersData = useMemo(() => ({}), []);
    return (
      <Provider store={store}>
        <DirectionProvider dir={direction}>
          <DataContext.Provider value={emptyChaptersData}>{children}</DataContext.Provider>
        </DirectionProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
