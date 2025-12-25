import React from 'react';

import classNames from 'classnames';
import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './LanguageContainer.module.scss';

import { getCountryLanguagePreference } from '@/api';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import IconArrowLeft from '@/icons/arrow-left.svg';
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
import { getLocaleName } from '@/utils/locale';
import { getCountryCodeForPreferences } from '@/utils/serverSideLanguageDetection';
import i18nConfig from 'i18n.json';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const { locales } = i18nConfig;

interface LanguageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  onBack: () => void;
}

const LanguageContainer: React.FC<LanguageContainerProps> = ({ show, onBack, ...props }) => {
  const { t, lang } = useTranslation('common');
  const userHasCustomised = useSelector(selectUserHasCustomised);
  const detectedCountry = useSelector(selectDetectedCountry);
  const dispatch = useDispatch();
  const toast = useToast();

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

  /**
   * Apply QDC defaults for new language (translations, tafsir, mushaf, wbw, etc.).
   * Uses dynamic API defaults.
   * Fails gracefully - UI language will still switch if defaults fail.
   */
  const applyDefaultsForNewLanguage = async (newLocale: string, loggedIn: boolean) => {
    try {
      const preferenceCountry = getCountryCodeForPreferences(newLocale, detectedCountry);
      const countryPreference = await getCountryLanguagePreference(newLocale, preferenceCountry);

      // Apply dynamic defaults from QDC API
      await dispatch(setDefaultsFromCountryPreference({ countryPreference, locale: newLocale }));

      // Persist the newly applied defaults if user is logged in
      if (loggedIn) {
        await dispatch(persistCurrentSettings());
      }
    } catch (error) {
      // Don't block locale change if defaults fail - UI language should still switch
      logError('Failed to apply QDC defaults on language change', error);
    }
  };

  /**
   * Persist the language preference to server for logged-in users.
   */
  const persistLanguagePreference = (newLocale: string, loggedIn: boolean) => {
    if (loggedIn) {
      addOrUpdateUserPreference(
        PreferenceGroup.LANGUAGE,
        newLocale,
        PreferenceGroup.LANGUAGE,
      ).catch(handleLanguagePersistError);
    }
  };

  /**
   * Handle language change with conditional defaults application.
   *
   * If user has NOT customised: apply QDC defaults for new locale
   * If user HAS customised: only switch UI locale, keep preferences intact
   */
  const onLanguageChange = async (newLocale: string) => {
    if (newLocale === lang) {
      onBack();
      return;
    }

    try {
      const loggedIn = isLoggedIn();

      // Apply defaults only if user hasn't customised their preferences
      if (!userHasCustomised) {
        await applyDefaultsForNewLanguage(newLocale, loggedIn);
      }

      logValueChange('locale', lang, newLocale);
      await setLanguage(newLocale);
      setLocaleCookie(newLocale);
      persistLanguagePreference(newLocale, loggedIn);
      onBack();
    } catch (error) {
      toast(t('error.language-change-failed'), { status: ToastStatus.Error });
      // Log the error to aid debugging of language change failures
      logError('Language change failed', error);
    }
  };

  return (
    <div
      {...props}
      role="dialog"
      aria-modal="true"
      aria-hidden={!show}
      aria-labelledby="language-dialog-title"
      data-testid="language-container"
      className={classNames(
        styles.languageContainer,
        {
          [styles.show]: show,
        },
        props.className,
      )}
    >
      <div className={styles.languageHeader}>
        <Button
          prefix={<IconArrowLeft />}
          variant={ButtonVariant.Compact}
          size={ButtonSize.Small}
          onClick={onBack}
          className={styles.backButton}
        >
          <span id="language-dialog-title" className={styles.languageTitle}>
            {t('select-language')}
          </span>
        </Button>
      </div>
      <div className={styles.languageList}>
        {locales.map((locale) => (
          <Button
            key={locale}
            onClick={() => onLanguageChange(locale)}
            variant={ButtonVariant.Ghost}
            aria-current={locale === lang ? 'true' : undefined}
            className={classNames(styles.languageItem, {
              [styles.selected]: locale === lang,
            })}
            data-testid={`language-item-${locale}`}
          >
            {getLocaleName(locale)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LanguageContainer;
