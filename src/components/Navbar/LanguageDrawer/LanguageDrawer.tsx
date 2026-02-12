import React, { useMemo, useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import Drawer, { DrawerSide, DrawerType } from '../Drawer';

import styles from './LanguageDrawer.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useLanguageChange from '@/hooks/useLanguageChange';
import IconArrowLeft from '@/icons/arrow-left.svg';
import {
  selectIsNavigationDrawerOpen,
  setIsLanguageDrawerOpen,
  setIsNavigationDrawerOpen,
} from '@/redux/slices/navbar';
import { getLocaleName } from '@/utils/locale';
import i18nConfig from 'i18n.json';

const { locales } = i18nConfig;

const LanguageDrawer = () => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const isNavigationDrawerOpen = useSelector(selectIsNavigationDrawerOpen);
  const { isChangingLanguage, changingLocale, onLanguageChange } = useLanguageChange();

  const closeDrawer = useCallback(() => {
    dispatch(setIsLanguageDrawerOpen(false));
    dispatch(setIsNavigationDrawerOpen(false));
  }, [dispatch]);

  const handleLanguageChange = useCallback(
    async (newLocale: string) => {
      await onLanguageChange(newLocale, closeDrawer);
    },
    [onLanguageChange, closeDrawer],
  );

  const header = useMemo(() => {
    const content = (
      <span id="language-dialog-title" className={styles.languageTitle}>
        {t('select-language')}
      </span>
    );

    if (isNavigationDrawerOpen) {
      return (
        <div className={styles.languageHeader}>
          <Button
            prefix={<IconArrowLeft />}
            variant={ButtonVariant.Ghost}
            size={ButtonSize.Small}
            onClick={closeDrawer}
            className={styles.backButton}
            isDisabled={isChangingLanguage}
          >
            {content}
          </Button>
        </div>
      );
    }

    return <div className={styles.languageHeader}>{content}</div>;
  }, [isNavigationDrawerOpen, t, closeDrawer, isChangingLanguage]);

  return (
    <Drawer id="language-drawer" type={DrawerType.Language} side={DrawerSide.Right} header={header}>
      <div className={styles.languageList}>
        {locales.map((locale) => (
          <Button
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            variant={ButtonVariant.Ghost}
            aria-current={locale === lang ? 'true' : undefined}
            className={classNames(styles.languageItem, {
              [styles.indented]: isNavigationDrawerOpen,
              [styles.selected]: locale === lang,
            })}
            data-testid={`language-item-${locale}`}
            isLoading={isChangingLanguage && changingLocale === locale}
            isDisabled={isChangingLanguage}
          >
            {getLocaleName(locale)}
          </Button>
        ))}
      </div>
    </Drawer>
  );
};

export default LanguageDrawer;
