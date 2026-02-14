import { useContext, useRef } from 'react';

import setLanguage from 'next-translate/setLanguage';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import getStore from './store';

import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { getUserPreferences } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { setLocaleCookie } from '@/utils/cookies';
import isClient from '@/utils/isClient';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import PreferenceGroup from 'types/auth/PreferenceGroup';

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
  /**
   * Keep a single Redux store instance for the lifetime of the app.
   *
   * We previously recreated the store on every locale change, which made locale switching
   * depend on redux-persist timing (rehydration vs. pending writes) and could cause
   * "stuck" locale-dependent settings in production after multiple flips.
   */
  const storeRef = useRef<ReturnType<typeof getStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = getStore(locale);
  }
  const store = storeRef.current;

  const persistorRef = useRef<ReturnType<typeof persistStore> | null>(null);
  if (!persistorRef.current) {
    persistorRef.current = persistStore(store);
  }
  const persistor = persistorRef.current;

  // Keep the initial locale around for preference sync semantics.
  const initialLocaleRef = useRef(locale);
  const audioService = useContext(AudioPlayerMachineContext);

  /**
   * Before the Gate lifts, we want to get the user preferences
   * then store in Redux so that they can be used.
   */
  const onBeforeLift = async () => {
    if (isClient && isLoggedIn()) {
      try {
        const userPreferences = await getUserPreferences();
        const remoteLocale = userPreferences[PreferenceGroup.LANGUAGE];
        if (remoteLocale) {
          await setLanguage(remoteLocale[PreferenceGroup.LANGUAGE]);
          setLocaleCookie(remoteLocale[PreferenceGroup.LANGUAGE]);
        }
        const localeForDefaults =
          remoteLocale?.[PreferenceGroup.LANGUAGE] || initialLocaleRef.current;
        store.dispatch(syncUserPreferences(userPreferences, localeForDefaults));
        const audioPlayerContext = audioService.getSnapshot().context;
        const playbackRate =
          userPreferences[PreferenceGroup.AUDIO]?.playbackRate || audioPlayerContext.playbackRate;
        const reciterId =
          userPreferences[PreferenceGroup.AUDIO]?.reciter || audioPlayerContext.reciterId;
        audioService.send({
          type: 'SET_INITIAL_CONTEXT',
          playbackRate,
          reciterId,
          volume: audioPlayerContext.volume,
        });
        // eslint-disable-next-line no-empty
      } catch (error) {}
    }
  };

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} onBeforeLift={onBeforeLift}>
        {() => <>{children}</>}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
