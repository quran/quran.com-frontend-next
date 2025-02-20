import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import heroButtonStyles from '@/components/HomePage/HeroButtons/HeroButtons.module.scss';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import TheListIcon from '@/icons/the_list.svg';
import { toggleIsVisible } from '@/redux/slices/QuranReader/sidebarNavigation';
import { logButtonClick } from '@/utils/eventLogger';

const NavigationButton = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('home');
  const onClick = () => {
    dispatch({ type: toggleIsVisible.type });
    logButtonClick('home_navigate_quran');
  };
  return (
    <Button
      variant={ButtonVariant.Simplified}
      className={heroButtonStyles.button}
      onClick={onClick}
      size={ButtonSize.Small}
    >
      <div className={heroButtonStyles.buttonContent}>
        <IconContainer size={IconSize.Xsmall} icon={<TheListIcon />} shouldForceSetColors={false} />
        <p className={heroButtonStyles.navigateQuranText}>{t('navigate-quran')}</p>
      </div>
    </Button>
  );
};

export default NavigationButton;
