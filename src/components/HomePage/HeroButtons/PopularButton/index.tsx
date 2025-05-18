import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './PopularButton.module.scss';

import heroButtonStyles from '@/components/HomePage/HeroButtons/HeroButtons.module.scss';
import PlayRadioButton from '@/components/HomePage/PlayRadioButton';
import QuickLinks from '@/components/HomePage/QuickLinks';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import CloseIcon from '@/icons/close.svg';
import PopularIcon from '@/icons/trend_up.svg';
import { logButtonClick } from '@/utils/eventLogger';

const PopularButton = () => {
  const { t } = useTranslation('home');
  const [isExpanded, setIsExpanded] = useState(false);
  const onClick = () => {
    logButtonClick('home_popular');
    setIsExpanded((prev) => !prev);
  };

  const onCloseClicked = () => {
    logButtonClick('home_popular_close');
    setIsExpanded(false);
  };
  return (
    <div className={styles.buttonWrapper}>
      <Button
        variant={ButtonVariant.Simplified}
        className={heroButtonStyles.button}
        onClick={onClick}
        size={ButtonSize.Small}
      >
        <div className={heroButtonStyles.buttonContent}>
          <IconContainer
            size={IconSize.Xsmall}
            icon={<PopularIcon />}
            shouldForceSetColors={false}
          />
          <p className={heroButtonStyles.popularText}>{t('popular')}</p>
        </div>
      </Button>
      {isExpanded && (
        <div className={styles.dropdownContainer}>
          <div className={styles.container}>
            <div className={styles.bodyContainer}>
              <div className={styles.header}>
                <div className={styles.popularHeader}>
                  <IconContainer
                    size={IconSize.Xsmall}
                    icon={<PopularIcon />}
                    shouldForceSetColors={false}
                  />
                  {t('popular')}
                </div>
                <Button
                  shape={ButtonShape.Circle}
                  variant={ButtonVariant.Ghost}
                  shouldFlipOnRTL={false}
                  onClick={onCloseClicked}
                >
                  <CloseIcon />
                </Button>
              </div>
              <hr />
              <div className={styles.body}>
                <p className={styles.chaptersAndVerses}>{t('chapters-and-verses')}</p>
                <QuickLinks />
                <hr />
                <PlayRadioButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopularButton;
