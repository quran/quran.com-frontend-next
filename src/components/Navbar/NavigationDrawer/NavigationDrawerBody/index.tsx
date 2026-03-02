import React, { useCallback } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import NavigationDrawerList from '../NavigationDrawerList';

import styles from './NavigationDrawerBody.module.scss';

import FundraisingBanner from '@/components/Fundraising/FundraisingBanner';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Spinner from '@/dls/Spinner/Spinner';
import IconDiamond from '@/icons/diamond.svg';
import IconGlobe from '@/icons/globe.svg';
import { setIsLanguageDrawerOpen } from '@/redux/slices/navbar';
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

interface NavigationDrawerBodyProps {
  isLanguageDrawerOpen: boolean;
}

const NavigationDrawerBody = ({ isLanguageDrawerOpen }: NavigationDrawerBodyProps): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();

  const onLanguageButtonClick = useCallback(() => {
    dispatch(setIsLanguageDrawerOpen(true));
    logEvent(EVENT_NAMES.NAV_DRAWER_LANGUAGE_OPEN);
  }, [dispatch]);

  const onDonateClick = useCallback(() => {
    logButtonClick(EVENT_NAMES.NAV_DRAWER_DONATE);
  }, []);

  return (
    <div className={styles.listItemsContainer} data-testid="navigation-drawer-body">
      <div
        className={styles.mainListItems}
        aria-hidden={isLanguageDrawerOpen}
        inert={isLanguageDrawerOpen || undefined}
      >
        <div className={styles.listItems}>
          <FundraisingBanner />
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
              className={styles.languageTrigger}
              prefix={<IconGlobe />}
              variant={ButtonVariant.Ghost}
              size={ButtonSize.Small}
              shape={ButtonShape.Pill}
              onClick={onLanguageButtonClick}
              data-testid="language-selector-button"
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
