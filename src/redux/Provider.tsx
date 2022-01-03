import { useMemo } from 'react';

import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import getStore from './store';

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

  if (isClient) {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
    );
  }

  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
