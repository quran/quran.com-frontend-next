import React from 'react';

import classNames from 'classnames';
import setLanguage from 'next-translate/setLanguage';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './LanguageContainer.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import IconArrowLeft from '@/icons/arrow-left.svg';
import resetSettings from '@/redux/actions/reset-settings';
import { selectIsUsingDefaultSettings } from '@/redux/slices/defaultSettings';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { setLocaleCookie } from '@/utils/cookies';
import { logValueChange } from '@/utils/eventLogger';
import { getLocaleName } from '@/utils/locale';
import i18nConfig from 'i18n.json';
import PreferenceGroup from 'types/auth/PreferenceGroup';

const { locales } = i18nConfig;

interface LanguageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  onBack: () => void;
}

const LanguageContainer: React.FC<LanguageContainerProps> = ({ show, onBack, ...props }) => {
  const { t, lang } = useTranslation('common');
  const isUsingDefaultSettings = useSelector(selectIsUsingDefaultSettings);
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

  const onLanguageChange = async (newLocale: string) => {
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
      ).catch(handleLanguagePersistError);
    }

    onBack();
  };

  return (
    <div
      {...props}
      role="dialog"
      aria-modal="true"
      aria-hidden={!show}
      aria-labelledby="language-dialog-title"
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
            className={classNames(styles.languageItem, {
              [styles.selected]: locale === lang,
            })}
          >
            {getLocaleName(locale)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LanguageContainer;
