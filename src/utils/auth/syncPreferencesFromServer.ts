import { Dispatch, AnyAction } from '@reduxjs/toolkit';
import setLanguage from 'next-translate/setLanguage';
import { InterpreterFrom } from 'xstate';

import { getCountryLanguagePreference } from '@/api';
import syncUserPreferences from '@/redux/actions/sync-user-preferences';
import {
  setAyahReflectionsLanguageIsoCodes,
  setLearningPlanLanguageIsoCodes,
  setUserHasCustomised,
} from '@/redux/slices/defaultSettings';
import { getUserPreferences } from '@/utils/auth/api';
import { setLocaleCookie } from '@/utils/cookies';
import {
  detectUserLanguageAndCountry,
  getCountryCodeForPreferences,
} from '@/utils/serverSideLanguageDetection';
import { audioPlayerMachine } from '@/xstate/actors/audioPlayer/audioPlayerMachine';
import PreferenceGroup from 'types/auth/PreferenceGroup';
import UserPreferencesResponse from 'types/auth/UserPreferencesResponse';

type SyncPreferencesParams = {
  locale: string;
  dispatch: Dispatch<AnyAction>;
  audioService?: InterpreterFrom<typeof audioPlayerMachine>;
};

export type SyncPreferencesResult = {
  hasRemotePreferences: boolean;
  appliedLocale?: string;
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
// eslint-disable-next-line react-func/max-lines-per-function
export const syncPreferencesFromServer = async ({
  locale,
  dispatch,
  audioService,
}: SyncPreferencesParams): Promise<SyncPreferencesResult> => {
  const userPreferences = await getUserPreferences();
  if (!hasUserPreferences(userPreferences)) {
    dispatch(setUserHasCustomised(false));
    return { hasRemotePreferences: false };
  }

  const userCustomizationPreferences = userPreferences[PreferenceGroup.USER_CUSTOMIZATION];
  const remoteUserHasCustomised =
    typeof userCustomizationPreferences?.userHasCustomised === 'boolean'
      ? userCustomizationPreferences.userHasCustomised
      : false;
  dispatch(setUserHasCustomised(remoteUserHasCustomised));

  const remoteLocale = userPreferences[PreferenceGroup.LANGUAGE]?.language;
  const preferencesLocale = remoteLocale || locale;

  dispatch(syncUserPreferences(userPreferences, preferencesLocale));
  applyAudioPreferences(userPreferences, audioService);

  // Update language preferences (learning plans & ayah reflections) based on user's language preference
  if (remoteLocale) {
    try {
      // Detect country for the user's language
      const { detectedCountry } = detectUserLanguageAndCountry(remoteLocale, undefined);
      const preferenceCountry = getCountryCodeForPreferences(remoteLocale, detectedCountry);

      // Fetch country language preference for the user's language
      const countryPreference = await getCountryLanguagePreference(remoteLocale, preferenceCountry);

      // Extract learning plan language codes
      const learningPlanLanguageIsoCodes = countryPreference?.learningPlanLanguages?.map(
        (lang) => lang.isoCode,
      ) || ['en'];

      // Extract ayah reflections language codes
      const ayahReflectionsLanguageIsoCodes = countryPreference?.ayahReflectionsLanguages?.map(
        (lang) => lang.isoCode,
      ) || ['en'];

      // Update both language settings in the store
      dispatch(setLearningPlanLanguageIsoCodes(learningPlanLanguageIsoCodes));
      dispatch(setAyahReflectionsLanguageIsoCodes(ayahReflectionsLanguageIsoCodes));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update language preferences after login', error);
    }

    setLocaleCookie(remoteLocale);
    if (remoteLocale !== locale) {
      await setLanguage(remoteLocale);
    }

    return { hasRemotePreferences: true, appliedLocale: remoteLocale };
  }

  return { hasRemotePreferences: true, appliedLocale: preferencesLocale };
};

export default syncPreferencesFromServer;
