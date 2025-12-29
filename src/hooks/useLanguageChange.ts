import { useState } from 'react';

import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import { getCountryLanguagePreference } from '@/api';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logError } from '@/lib/newrelic';
import {
  persistCurrentSettings,
  selectDetectedCountry,
  selectUserHasCustomised,
  setDefaultsFromCountryPreference,
} from '@/redux/slices/defaultSettings';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { setLocaleCookie } from '@/utils/cookies';
import { logValueChange } from '@/utils/eventLogger';
import { getCountryCodeForPreferences } from '@/utils/serverSideLanguageDetection';
import PreferenceGroup from 'types/auth/PreferenceGroup';

interface UseLanguageChangeReturn {
  isChangingLanguage: boolean;
  changingLocale: string | null;
  onLanguageChange: (newLocale: string, onComplete?: () => void) => Promise<void>;
}

const useLanguageChange = (): UseLanguageChangeReturn => {
  const { t, lang } = useTranslation('common');
  const userHasCustomised = useSelector(selectUserHasCustomised);
  const detectedCountry = useSelector(selectDetectedCountry);
  const dispatch = useDispatch();
  const toast = useToast();
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [changingLocale, setChangingLocale] = useState<string | null>(null);

  const handleLanguagePersistError = () => {
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
          onClick: () => {
            // do nothing
          },
        },
      ],
    });
  };

  const applyDefaultsForNewLanguage = async (newLocale: string, loggedIn: boolean) => {
    try {
      const preferenceCountry = getCountryCodeForPreferences(newLocale, detectedCountry);
      const countryPreference = await getCountryLanguagePreference(newLocale, preferenceCountry);

      await dispatch(setDefaultsFromCountryPreference({ countryPreference, locale: newLocale }));

      if (loggedIn) {
        await dispatch(persistCurrentSettings());
      }
    } catch (error) {
      logError('Failed to apply QDC defaults on language change', error);
    }
  };

  const persistLanguagePreference = (newLocale: string, loggedIn: boolean) => {
    if (loggedIn) {
      addOrUpdateUserPreference(
        PreferenceGroup.LANGUAGE,
        newLocale,
        PreferenceGroup.LANGUAGE,
      ).catch(handleLanguagePersistError);
    }
  };

  const onLanguageChange = async (newLocale: string, onComplete?: () => void) => {
    if (newLocale === lang) {
      onComplete?.();
      return;
    }

    if (isChangingLanguage) {
      return;
    }

    setIsChangingLanguage(true);
    setChangingLocale(newLocale);

    try {
      const loggedIn = isLoggedIn();

      if (!userHasCustomised) {
        await applyDefaultsForNewLanguage(newLocale, loggedIn);
      }

      logValueChange('locale', lang, newLocale);
      await setLanguage(newLocale);
      setLocaleCookie(newLocale);
      persistLanguagePreference(newLocale, loggedIn);
      onComplete?.();
    } catch (error) {
      toast(t('error.language-change-failed'), { status: ToastStatus.Error });
      logError('Language change failed', error);
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
