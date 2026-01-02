import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import LanguageContainer from '../LanguageContainer';
import NavigationDrawerList from '../NavigationDrawerList';

import styles from './NavigationDrawerBody.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import IconDiamond from '@/icons/diamond.svg';
import IconGlobe from '@/icons/globe.svg';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { getLocaleName } from '@/utils/locale';

const ThemeSwitcher = dynamic(() => import('../ThemeSwitcher'), {
  ssr: false,
  loading: () => <Spinner />,
});

const EVENT_NAMES = {
  NAV_DRAWER_LANGUAGE_OPEN: 'navigation_drawer_language_selector_open',
  NAV_DRAWER_LANGUAGE_CLOSE: 'navigation_drawer_language_selector_close',
  NAV_DRAWER_DONATE: 'navigation_drawer_donate',
} as const;

const NavigationDrawerBody = (): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const [showLanguageContainer, setShowLanguageContainer] = useState(false);
  const languageButtonRef = useRef<HTMLButtonElement | null>(null);

  const onLanguageButtonClick = useCallback(() => {
    setShowLanguageContainer(true);
    logEvent(EVENT_NAMES.NAV_DRAWER_LANGUAGE_OPEN);
  }, []);

  const onBackButtonClick = useCallback(() => {
    setShowLanguageContainer(false);
    logEvent(EVENT_NAMES.NAV_DRAWER_LANGUAGE_CLOSE);
  }, []);

  const onDonateClick = useCallback(() => {
    logButtonClick(EVENT_NAMES.NAV_DRAWER_DONATE);
  }, []);

  useEffect(() => {
    if (!showLanguageContainer && languageButtonRef.current) {
      languageButtonRef.current.focus(); // restore
    }
  }, [showLanguageContainer]);

  return (
    <div className={styles.listItemsContainer} data-testid="navigation-drawer-body">
      <LanguageContainer
        id="nav-lang-container"
        show={showLanguageContainer}
        onBack={onBackButtonClick}
      />
      <div
        className={classNames(styles.mainListItems, {
          [styles.hide]: showLanguageContainer,
        })}
        aria-hidden={showLanguageContainer}
        inert={showLanguageContainer || undefined}
      >
        <div className={styles.listItems}>
          <NavigationDrawerList
            accordionHeaderLeftClassName={styles.accordionHeaderLeft}
            accordionContentClassName={styles.accordionContent}
            accordionItemTitleClassName={styles.accordionItemTitle}
            projectsDescClassName={styles.projectsDesc}
          />
        </div>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaTop}>
            <Button
              ref={languageButtonRef}
              className={styles.languageTrigger}
              prefix={<IconGlobe />}
              variant={ButtonVariant.Ghost}
              size={ButtonSize.Small}
              shape={ButtonShape.Pill}
              onClick={onLanguageButtonClick}
              aria-expanded={showLanguageContainer}
              data-testid="language-selector-button"
              aria-controls="nav-lang-container"
              aria-haspopup="dialog"
            >
              {getLocaleName(lang) || lang}
            </Button>
            <ThemeSwitcher />
          </div>
          <Button
            href={makeDonatePageUrl(false, true)}
            isNewTab
            prefix={<IconDiamond />}
            className={styles.ctaDonateButton}
            size={ButtonSize.Small}
            variant={ButtonVariant.Accent}
            shape={ButtonShape.Pill}
            onClick={onDonateClick}
          >
            {t('fundraising.title')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavigationDrawerBody;
