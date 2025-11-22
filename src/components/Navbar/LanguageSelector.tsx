/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import Button, { ButtonShape, ButtonVariant } from '../dls/Button/Button';
import PopoverMenu, { PopoverMenuExpandDirection } from '../dls/PopoverMenu/PopoverMenu';
import { ToastStatus, useToast } from '../dls/Toast/Toast';

import styles from './LanguageSelector.module.scss';

import { getCountryLanguagePreference } from '@/api';
import ChevronSelectIcon from '@/icons/chevron-select.svg';
import GlobeIcon from '@/icons/globe.svg';
import {
  selectUserHasCustomised,
  selectDetectedCountry,
  setDefaultsFromCountryPreference,
  persistCurrentSettings,
} from '@/redux/slices/defaultSettings';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { setLocaleCookie } from '@/utils/cookies';
import { logEvent, logValueChange } from '@/utils/eventLogger';
import { getLocaleName } from '@/utils/locale';
import { getCountryCodeForPreferences } from '@/utils/serverSideLanguageDetection';
import i18nConfig from 'i18n.json';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const { locales } = i18nConfig;

const options = locales.map((lng) => ({
  label: getLocaleName(lng),
  value: lng,
}));

type LanguageSelectorProps = {
  shouldShowSelectedLang?: boolean;
  expandDirection?: PopoverMenuExpandDirection;
};

const LanguageSelector = ({
  shouldShowSelectedLang: isFooter,
  expandDirection = PopoverMenuExpandDirection.BOTTOM,
}: LanguageSelectorProps) => {
  const userHasCustomised = useSelector(selectUserHasCustomised);
  const detectedCountry = useSelector(selectDetectedCountry);
  const dispatch = useDispatch();
  const { t, lang } = useTranslation('common');
  const toast = useToast();

  /**
   * When the user changes the language, we will:
   *
   * 1. Call next-translate's setLanguage with the new value.
   * 2. Store the new value of the locale in the cookies so that next time the user
   * lands on the `/` route, he will be redirected to the homepage with the
   * saved locale. This is to over-ride next.js's default behavior which takes
   * into consideration `Accept-language` header {@see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language}
   * as a locale detection mechanism. For further reading on Next.js's behavior
   * {@see https://nextjs.org/docs/advanced-features/i18n-routing}.
   *
   * @param {string} newLocale
   */
  const onChange = async (newLocale: string) => {
    const loggedIn = isLoggedIn();
    // if the user didn't change the settings and he is transitioning to a new locale, we want to apply the default settings of the new locale
    if (!userHasCustomised) {
      const preferenceCountry = getCountryCodeForPreferences(newLocale, detectedCountry);
      const countryPreference = await getCountryLanguagePreference(newLocale, preferenceCountry);
      if (countryPreference) {
        await dispatch(setDefaultsFromCountryPreference({ countryPreference, locale: newLocale }));
        if (loggedIn) {
          try {
            await dispatch(persistCurrentSettings());
          } catch (persistError) {
            // eslint-disable-next-line no-console
            console.error(
              'Failed to persist settings after applying defaults on language change',
              persistError,
            );
          }
        }
      }
    }
    logValueChange('locale', lang, newLocale);

    setLocaleCookie(newLocale);
    await setLanguage(newLocale);

    if (loggedIn) {
      addOrUpdateUserPreference(
        PreferenceGroup.LANGUAGE,
        newLocale,
        PreferenceGroup.LANGUAGE,
      ).catch(() => {
        toast(t('error.pref-persist-fail'), {
          status: ToastStatus.Warning,
          actions: [
            {
              text: t('undo'),
              primary: true,
              onClick: async () => {
                setLocaleCookie(newLocale);
                await setLanguage(newLocale);
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
      });
    }
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      if (isFooter) {
        logEvent(`footer_language_selector_open`);
      } else {
        logEvent(`navbar_language_selector_open`);
      }
      return;
    }

    if (isFooter) {
      logEvent(`footer_language_selector_close`);
    } else {
      logEvent(`navbar_language_selector_close`);
    }
  };

  return (
    <PopoverMenu
      expandDirection={expandDirection}
      trigger={
        isFooter ? (
          <Button
            className={styles.triggerButton}
            prefix={
              <span className={styles.globeIconWrapper}>
                <GlobeIcon />
              </span>
            }
            tooltip={t('languages')}
            data-testid="language-selector-button-footer"
            variant={ButtonVariant.Ghost}
            suffix={
              <span className={styles.triggerSuffixContainer}>
                <ChevronSelectIcon />
              </span>
            }
          >
            {getLocaleName(lang)}
          </Button>
        ) : (
          <Button
            tooltip={t('languages')}
            shape={ButtonShape.Circle}
            variant={ButtonVariant.Ghost}
            data-testid="language-selector-button-navbar"
            ariaLabel={t('aria.select-lng')}
          >
            <span className={styles.globeIconWrapper}>
              <GlobeIcon />
            </span>
          </Button>
        )
      }
      onOpenChange={onOpenChange}
      isPortalled={false}
      contentClassName={styles.languageMenuContent}
    >
      {options.map((option) => (
        <PopoverMenu.Item
          isSelected={option.value === lang}
          shouldCloseMenuAfterClick
          key={option.value}
          dataTestId={`language-selector-item-${option.value}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </PopoverMenu.Item>
      ))}
    </PopoverMenu>
  );
};

export default LanguageSelector;
