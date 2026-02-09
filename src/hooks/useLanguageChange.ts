import { useState } from 'react';

import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import resetSettings from '@/redux/actions/reset-settings';
import syncLocaleDependentSettings from '@/redux/actions/sync-locale-dependent-settings';
import { selectIsUsingDefaultSettings } from '@/redux/slices/defaultSettings';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { setLocaleCookie } from '@/utils/cookies';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';

interface UseLanguageChangeReturn {
  isChangingLanguage: boolean;
  changingLocale: string | null;
  onLanguageChange: (newLocale: string, onComplete?: () => void) => Promise<void>;
}

const useLanguageChange = (): UseLanguageChangeReturn => {
  const { t, lang } = useTranslation('common');
  const isUsingDefaultSettings = useSelector(selectIsUsingDefaultSettings);
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
      const loggedIn = isLoggedIn();

      // Guest-only: keep locale-dependent content tabs (tafsir, lessons, reflections, etc.)
      // following defaults unless the user has customized those preferences.
      if (!loggedIn && !isUsingDefaultSettings) {
        dispatch(syncLocaleDependentSettings({ prevLocale: lang, nextLocale: newLocale }));
      }

      // Apply default settings of the new locale if user hasn't customized settings
      if (isUsingDefaultSettings) {
        dispatch(resetSettings(newLocale));
      }

      logValueChange('locale', lang, newLocale);
      await setLanguage(newLocale);
      setLocaleCookie(newLocale);

      if (loggedIn) {
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
