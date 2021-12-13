import React from 'react';

import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import GlobeIcon from '../../../public/icons/globe.svg';
import Button, { ButtonShape, ButtonVariant } from '../dls/Button/Button';
import PopoverMenu from '../dls/PopoverMenu/PopoverMenu';

import styles from './LanguageSelector.module.scss';

import i18nConfig from 'i18n.json';
import { selectIsUsingDefaultSettings } from 'src/redux/slices/defaultSettings';
import resetSettings from 'src/redux/slices/reset-settings';
import { getLocaleName } from 'src/utils/locale';

const { locales } = i18nConfig;

const options = locales.map((lng) => ({
  label: getLocaleName(lng),
  value: lng,
}));

const COOKIE_PERSISTENCE_PERIOD_MS = 86400000000000; // maximum milliseconds-since-the-epoch value https://stackoverflow.com/a/56980560/1931451

const LanguageSelector = () => {
  const isUsingDefaultSettings = useSelector(selectIsUsingDefaultSettings);
  const dispatch = useDispatch();
  const { t, lang } = useTranslation('common');

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
    await setLanguage(newLocale);
    const date = new Date();
    date.setTime(COOKIE_PERSISTENCE_PERIOD_MS);
    // eslint-disable-next-line i18next/no-literal-string
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`;
  };

  return (
    <PopoverMenu
      trigger={
        <Button
          tooltip={t('settings.title')}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Ghost}
        >
          <span className={styles.globeIconWrapper}>
            <GlobeIcon />
          </span>
        </Button>
      }
    >
      {options.map((option) => (
        <PopoverMenu.Item
          selected={option.value === lang}
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
