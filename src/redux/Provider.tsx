import React, { useContext, useMemo, useEffect } from 'react';

import setLanguage from 'next-translate/setLanguage';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { RootState } from './RootState';
import getStore from './store';

import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { getUserPreferences } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { setLocaleCookie } from '@/utils/cookies';
import isClient from '@/utils/isClient';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
import { CountryLanguagePreferenceResponse } from 'types/ApiResponses';
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
const ReduxProvider = ({
  children,
  locale,
  countryLanguagePreference,
  reduxState,
}: {
  children: React.ReactNode;
  locale: string;
  countryLanguagePreference?: CountryLanguagePreferenceResponse;
  reduxState?: RootState;
}) => {
  const store = useMemo(
    () => getStore(locale, countryLanguagePreference, reduxState),
    [locale, countryLanguagePreference, reduxState],
  );
  const persistor = useMemo(() => persistStore(store), [store]);
  const audioService = useContext(AudioPlayerMachineContext);

  // Expose store to window for testing purposes
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-underscore-dangle
      (window as any).__store = store;
    }
  }, [store]);

  /**
   * Helper to set the audio player context with consistent parameters
   */
  const setAudioPlayerContext = (playbackRate: number, reciterId: number, volume: number) => {
    audioService.send({
      type: 'SET_INITIAL_CONTEXT',
      playbackRate,
      reciterId,
      volume,
    });
  };

  const applyGuestDefaults = () => {
    if (isClient && countryLanguagePreference) {
      /**
       * Guest user – we need to apply the default reciter coming from the country-language preference.
       * We also respect the playback rate and volume coming from localStorage (if any).
       */
      const audioPlayerContext = audioService.getSnapshot().context;
      setAudioPlayerContext(
        audioPlayerContext.playbackRate,
        countryLanguagePreference.defaultReciter?.id ?? audioPlayerContext.reciterId,
        audioPlayerContext.volume,
      );
    }
  };

  /**
   * Before the Gate lifts, we want to get the user preferences
   * then store in Redux so that they can be used.
   */
  const onBeforeLift = async () => {
    if (isClient && isLoggedIn()) {
      try {
        const userPreferences = await getUserPreferences();
        // if the user has no preferences, apply guest defaults
        if (Object?.keys(userPreferences)?.length === 0) {
          applyGuestDefaults();
          return;
        }

        const remoteLocale = userPreferences[PreferenceGroup.LANGUAGE];
        if (remoteLocale) {
          await setLanguage(remoteLocale[PreferenceGroup.LANGUAGE]);
          setLocaleCookie(remoteLocale[PreferenceGroup.LANGUAGE]);
        }
        store.dispatch(syncUserPreferences(userPreferences, locale));
        const audioPlayerContext = audioService.getSnapshot().context;
        const playbackRate =
          userPreferences[PreferenceGroup.AUDIO]?.playbackRate || audioPlayerContext.playbackRate;
        const reciterId =
          userPreferences[PreferenceGroup.AUDIO]?.reciter || audioPlayerContext.reciterId;
        setAudioPlayerContext(playbackRate, reciterId, audioPlayerContext.volume);
        // eslint-disable-next-line no-empty
      } catch (error) {}
    } else {
      applyGuestDefaults();
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
