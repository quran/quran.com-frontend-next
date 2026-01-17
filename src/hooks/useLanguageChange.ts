/* eslint-disable react-func/max-lines-per-function */
import { useState } from 'react';

import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import { getCountryLanguagePreference } from '@/api';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logErrorToSentry } from '@/lib/sentry';
import resetSettings from '@/redux/actions/reset-settings';
import {
  selectDetectedCountry,
  selectIsUsingDefaultSettings,
  setDefaultsFromCountryPreference,
  setIsUsingDefaultSettings,
  setUserHasCustomised,
} from '@/redux/slices/defaultSettings';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { setLocaleCookie } from '@/utils/cookies';
import { getCountryCodeForPreferences } from '@/utils/serverSideLanguageDetection';
import PreferenceGroup from 'types/auth/PreferenceGroup';

interface UseLanguageChangeReturn {
  isChangingLanguage: boolean;
  changingLocale: string | null;
  onLanguageChange: (newLocale: string, onComplete?: () => void) => Promise<void>;
}

const useLanguageChange = (): UseLanguageChangeReturn => {
  const { t, lang } = useTranslation('common');
  const isUsingDefaultSettings = useSelector(selectIsUsingDefaultSettings);
  const detectedCountry = useSelector(selectDetectedCountry);
  const dispatch = useDispatch();
  const toast = useToast();
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [changingLocale, setChangingLocale] = useState<string | null>(null);

  const handlePreferencePersistError = () => {
    toast(t('error.pref-persist-fail'), {
      status: ToastStatus.Warning,
      actions: [
        {
          text: t('undo'),
          primary: true,
          onClick: async () => {
            await setLanguage(lang);
            setLocaleCookie(lang);
          },
        },
        {
          text: t('continue'),
          primary: false,
          onClick: () => {},
        },
      ],
    });
  };

  const onLanguageChange = async (newLocale: string, onComplete?: () => void) => {
    if (newLocale === lang) {
      onComplete?.();
      return;
    }
    if (isChangingLanguage) return;

    setIsChangingLanguage(true);
    setChangingLocale(newLocale);

    try {
      // Apply default settings of the new locale if user hasn't customized settings
      if (isUsingDefaultSettings) {
        dispatch(resetSettings(newLocale));
      }

      if (isUsingDefaultSettings) {
        try {
          const preferenceCountry = getCountryCodeForPreferences(newLocale, detectedCountry);
          const countryPreference = await getCountryLanguagePreference(
            newLocale,
            preferenceCountry,
          );
          dispatch(setDefaultsFromCountryPreference({ countryPreference, locale: newLocale }));
        } catch (error) {
          logErrorToSentry('Error fetching country language preference:', error);
        }

        // Ensure defaults don't mark the user as customised when only switching language.
        dispatch(setIsUsingDefaultSettings(true));
        dispatch(setUserHasCustomised(false));
      }

      await setLanguage(newLocale);
      setLocaleCookie(newLocale);

      if (isLoggedIn()) {
        addOrUpdateUserPreference(
          PreferenceGroup.LANGUAGE,
          newLocale,
          PreferenceGroup.LANGUAGE,
        ).catch(handlePreferencePersistError);
      }

      onComplete?.();
    } finally {
      setIsChangingLanguage(false);
      setChangingLocale(null);
    }
  };

  return {
    isChangingLanguage,
    changingLocale,
    onLanguageChange,
  };
};

export default useLanguageChange;
