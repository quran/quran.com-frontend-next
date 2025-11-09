import { Dispatch, AnyAction } from '@reduxjs/toolkit';
import setLanguage from 'next-translate/setLanguage';
import { InterpreterFrom } from 'xstate';

import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import { getUserPreferences } from '@/utils/auth/api';
import { setLocaleCookie } from '@/utils/cookies';
import { audioPlayerMachine } from '@/xstate/actors/audioPlayer/audioPlayerMachine';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import UserPreferencesResponse from 'types/auth/UserPreferencesResponse';

type SyncPreferencesParams = {
  locale: string;
  dispatch: Dispatch<AnyAction>;
  audioService?: InterpreterFrom<typeof audioPlayerMachine>;
};

const hasUserPreferences = (preferences?: UserPreferencesResponse) => {
  if (!preferences) return false;
  return Object.keys(preferences).length > 0;
};

const applyAudioPreferences = (
  preferences: UserPreferencesResponse,
  audioService?: InterpreterFrom<typeof audioPlayerMachine>,
) => {
  if (!audioService) return;
  const audioContext = audioService.getSnapshot().context;
  const playbackRate =
    preferences[PreferenceGroup.AUDIO]?.playbackRate ?? audioContext.playbackRate;
  const reciterId = preferences[PreferenceGroup.AUDIO]?.reciter ?? audioContext.reciterId;

  audioService.send({
    type: 'SET_INITIAL_CONTEXT',
    playbackRate,
    reciterId,
    volume: audioContext.volume,
  });
};

/**
 * Fetch the authenticated user's preferences from the backend
 * and apply them to the Redux store and XState audio service.
 *
 * @returns {Promise<boolean>} whether preferences existed and got applied.
 */
export const syncPreferencesFromServer = async ({
  locale,
  dispatch,
  audioService,
}: SyncPreferencesParams): Promise<boolean> => {
  const userPreferences = await getUserPreferences();
  if (!hasUserPreferences(userPreferences)) {
    return false;
  }

  const remoteLocale = userPreferences[PreferenceGroup.LANGUAGE]?.language;
  if (remoteLocale) {
    setLocaleCookie(remoteLocale);
    await setLanguage(remoteLocale);
  }

  dispatch(syncUserPreferences(userPreferences, locale));
  applyAudioPreferences(userPreferences, audioService);

  return true;
};

export default syncPreferencesFromServer;
