import React, { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import LanguageContainer from '../LanguageContainer';
import NavigationDrawerList from '../NavigationDrawerList';
import ThemeSwitcher from '../ThemeSwitcher';

import styles from './NavigationDrawerBody.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconDiamond from '@/icons/diamond.svg';
import IconGlobe from '@/icons/globe.svg';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { getLocaleName } from '@/utils/locale';

const NavigationDrawerBody = () => {
  const { t, lang } = useTranslation('common');
  const [showLanguageContainer, setShowLanguageContainer] = useState(false);

  const onLanguageButtonClick = () => {
    setShowLanguageContainer(true);
    logEvent('navigation_drawer_language_selector_open');
  };

  const onBackButtonClick = () => {
    setShowLanguageContainer(false);
    logEvent('navigation_drawer_language_selector_close');
  };

  const onDonateClick = () => {
    logButtonClick('navigation_drawer_donate');
  };

  return (
    <div className={styles.listItemsContainer}>
      <LanguageContainer show={showLanguageContainer} onBack={onBackButtonClick} />
      <div
        className={classNames(styles.mainListItems, {
          [styles.hide]: showLanguageContainer,
        })}
      >
        <div className={styles.listItems}>
          <NavigationDrawerList
            accordionHeaderClassName={styles.accordionHeader}
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
            >
              {getLocaleName(lang)}
            </Button>
            <ThemeSwitcher />
          </div>
          <Button
            href="https://give.quran.foundation/give/474400/#!/donation/checkout"
            isNewTab
            prefix={<IconDiamond />}
            className={styles.ctaDonateButton}
            size={ButtonSize.Small}
            variant={ButtonVariant.Accent}
            shape={ButtonShape.Pill}
            onClick={onDonateClick}
          >
            {t('become-monthly-donor')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavigationDrawerBody;
