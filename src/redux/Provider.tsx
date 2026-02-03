/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
/* eslint-disable react-func/max-lines-per-function */
import React, { useContext, useMemo, useEffect, useRef, useCallback } from 'react';

import { Provider, useStore } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { RootState } from './RootState';
import getStore from './store';

import { isLoggedIn } from '@/utils/auth/login';
import { stateToPreferenceGroups } from '@/utils/auth/preferencesMapper';
import { syncPreferencesFromServer } from '@/utils/auth/syncPreferencesFromServer';
import isClient from '@/utils/isClient';
import {
  buildQdcPreferencesDocumentCookies,
  getQdcPreferencesFromCookieHeader,
} from '@/utils/qdcPreferencesCookies';
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

const PREFERENCES_COOKIE_DEBOUNCE_MS = 400;
const PREFERENCES_COOKIE_MAX_AGE_MS = 31536000000; // 1 year

const PreferencesCookieSync = ({
  audioService,
}: {
  audioService: React.ContextType<typeof AudioPlayerMachineContext>;
}) => {
  const store = useStore<RootState>();
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWrittenPrefsKeyRef = useRef<string | null>(null);
  const expiresRef = useRef<Date>(new Date(Date.now() + PREFERENCES_COOKIE_MAX_AGE_MS));

  const writePreferencesCookies = useCallback(() => {
    if (!isClient) return;

    const reduxState = store.getState();
    const preferenceGroups = stateToPreferenceGroups(reduxState);

    // Override audio preferences with the real values coming from XState.
    const audioContext = audioService?.getSnapshot?.().context;
    if (audioContext) {
      preferenceGroups[PreferenceGroup.AUDIO] = {
        ...(preferenceGroups[PreferenceGroup.AUDIO] || {}),
        reciter: audioContext.reciterId,
        playbackRate: audioContext.playbackRate,
      };
    }

    const built = buildQdcPreferencesDocumentCookies(preferenceGroups, {
      expires: expiresRef.current,
      secure: window.location.protocol === 'https:',
    });
    if (!built) return;

    if (built.prefsKey === lastWrittenPrefsKeyRef.current) return;

    built.cookies.forEach((cookie) => {
      document.cookie = cookie;
    });

    lastWrittenPrefsKeyRef.current = built.prefsKey;
  }, [audioService, store]);

  const scheduleWrite = useCallback(() => {
    if (!isClient) return;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(
      writePreferencesCookies,
      PREFERENCES_COOKIE_DEBOUNCE_MS,
    );
  }, [writePreferencesCookies]);

  useEffect(() => {
    if (!isClient) return undefined;

    // Initialize with the current cookie value to avoid rewriting on mount.
    const { preferencesKey } = getQdcPreferencesFromCookieHeader(document.cookie);
    lastWrittenPrefsKeyRef.current = preferencesKey;

    // Keep cookie snapshot synced with Redux + audio context.
    const unsubscribeStore = store.subscribe(scheduleWrite);
    const unsubscribeAudio = audioService?.subscribe?.(scheduleWrite);

    // Also do an initial sync shortly after mount.
    scheduleWrite();

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      unsubscribeStore();
      // XState subscriptions return { unsubscribe() }.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      unsubscribeAudio?.unsubscribe?.();
    };
  }, [audioService, scheduleWrite, store]);

  return null;
};

const ReduxProvider = ({
  children,
  locale,
  countryLanguagePreference,
  reduxState,
  ssrPreferencesApplied,
}: {
  children: React.ReactNode;
  locale: string;
  countryLanguagePreference?: CountryLanguagePreferenceResponse;
  reduxState?: RootState;
  ssrPreferencesApplied?: boolean;
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
      if (ssrPreferencesApplied) {
        // SSR already applied the preferences snapshot into Redux. Avoid an extra
        // waterfall by skipping the remote preferences fetch and just syncing
        // XState audio context from the cookie snapshot.
        const { preferences } = getQdcPreferencesFromCookieHeader(document.cookie);
        const audioPreferences = preferences?.[PreferenceGroup.AUDIO];
        if (audioPreferences) {
          const audioContext = audioService.getSnapshot().context;
          setAudioPlayerContext(
            audioPreferences.playbackRate ?? audioContext.playbackRate,
            audioPreferences.reciter ?? audioContext.reciterId,
            audioContext.volume,
          );
        }
        return;
      }

      try {
        const { hasRemotePreferences } = await syncPreferencesFromServer({
          locale,
          dispatch: store.dispatch,
          audioService,
        });

        if (!hasRemotePreferences) {
          applyGuestDefaults();
        }
      } catch (error) {
        applyGuestDefaults();
      }
    } else {
      applyGuestDefaults();
    }
  };

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} onBeforeLift={onBeforeLift}>
        {() => (
          <>
            <PreferencesCookieSync audioService={audioService} />
            {children}
          </>
        )}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;
