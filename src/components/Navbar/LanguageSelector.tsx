/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import Button, { ButtonShape, ButtonVariant } from '../dls/Button/Button';
import PopoverMenu, { PopoverMenuExpandDirection } from '../dls/PopoverMenu/PopoverMenu';
import { ToastStatus, useToast } from '../dls/Toast/Toast';

import styles from './LanguageSelector.module.scss';

import ChevronSelectIcon from '@/icons/chevron-select.svg';
import GlobeIcon from '@/icons/globe.svg';
import resetSettings from '@/redux/actions/reset-settings';
import { selectIsUsingDefaultSettings } from '@/redux/slices/defaultSettings';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { setLocaleCookie } from '@/utils/cookies';
import { logEvent, logValueChange } from '@/utils/eventLogger';
import { getLocaleName } from '@/utils/locale';
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
  const isUsingDefaultSettings = useSelector(selectIsUsingDefaultSettings);
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
    // if the user didn't change the settings and he is transitioning to a new locale, we want to apply the default settings of the new locale
    if (isUsingDefaultSettings) {
      dispatch(resetSettings(newLocale));
    }
    logValueChange('locale', lang, newLocale);

    await setLanguage(newLocale);
    setLocaleCookie(newLocale);

    if (isLoggedIn()) {
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
                await setLanguage(newLocale);
                setLocaleCookie(newLocale);
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
    >
      {options.map((option) => (
        <PopoverMenu.Item
          isSelected={option.value === lang}
          shouldCloseMenuAfterClick
          key={option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </PopoverMenu.Item>
      ))}
    </PopoverMenu>
  );
};

export default LanguageSelector;
