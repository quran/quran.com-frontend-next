import { useMemo } from 'react';

import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import getStore from './store';

import syncUserPreferences from 'src/redux/actions/sync-user-preferences';
import { getUserPreferences } from 'src/utils/auth/api';
import { isLoggedIn } from 'src/utils/auth/login';

/**
 * A wrapper around the Provider component to skip rendering <PersistGate />
 * on the server. PersistGate prevents children from rendering until the persisted
 * state is retrieved from localstorage, this results in an empty DOM for SSR and SSG.
 * For more info: https://github.com/rt2zz/redux-persist/issues/1008
 *
 * @param {any} props
 * @returns {Provider}
 */
const ReduxProvider = ({ children, locale }) => {
  const store = useMemo(() => getStore(locale), [locale]);
  const persistor = useMemo(() => persistStore(store), [store]);

  const isClient = !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  );

  /**
   * Before the Gate lifts, we want to get the user preferences
   * then store in Redux so that they can be used.
   */
  const onBeforeLift = async () => {
    if (isClient && isLoggedIn()) {
      try {
        const userPreferences = await getUserPreferences(locale);
        store.dispatch(syncUserPreferences(userPreferences));
        // eslint-disable-next-line no-empty
      } catch (error) {}
    }
  };

  if (isClient) {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor} onBeforeLift={onBeforeLift}>
          {children}
        </PersistGate>
      </Provider>
    );
  }

  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
