import { type ReactElement, useMemo } from 'react';

import { DirectionProvider } from '@radix-ui/react-direction';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';

import { makeStore, type TestStore } from './redux';
import type { DeepPartial } from './types';

import { AuthContext, type AuthContextType } from '@/contexts/AuthContext';
import DataContext from '@/contexts/DataContext';
import type { RootState } from '@/redux/RootState';
import type ChaptersData from 'types/ChaptersData';

/**
 * Providers included in this wrapper:
 *   - Redux store (no redux-persist; no localStorage side effects)
 *   - DirectionProvider (RTL support via `direction` option)
 *   - AuthContext (guest state by default; override via `authState` option)
 *   - DataContext (empty chapters map by default)
 *
 * Providers intentionally omitted (mock per-test as needed):
 *   - i18n / next-translate — mock useTranslation() with vi.mock('next-translate/useTranslation')
 *   - ToastProvider — not required for unit tests
 *   - AudioPlayerMachineProvider — initialises XState actors; mock useAudioPlayer() directly
 */

/**
 * Guest auth context used when no `authState` override is provided.
 * isLoading=false + profileLoaded=true prevents components from rendering
 * indefinite loading spinners during unit tests.
 */
const guestAuthContext: AuthContextType = {
  state: {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    isProfileComplete: null,
    profileLoaded: true,
  },
  dispatch: () => undefined,
  login: () => undefined,
  logout: () => undefined,
  updateProfile: () => undefined,
};

interface Options extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: DeepPartial<RootState>;
  store?: TestStore;
  direction?: 'ltr' | 'rtl';
  authState?: Partial<AuthContextType>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {} as DeepPartial<RootState>,
    store = makeStore(preloadedState),
    direction = 'ltr',
    authState,
    ...options
  }: Options = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const emptyChaptersData = useMemo<ChaptersData>(() => ({}), []);
    const authContextValue = useMemo<AuthContextType>(
      () => ({ ...guestAuthContext, ...authState }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );
    return (
      <Provider store={store}>
        <DirectionProvider dir={direction}>
          <AuthContext.Provider value={authContextValue}>
            <DataContext.Provider value={emptyChaptersData}>{children}</DataContext.Provider>
          </AuthContext.Provider>
        </DirectionProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
