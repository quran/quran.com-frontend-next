import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import heroButtonStyles from '@/components/HomePage/HeroButtons/HeroButtons.module.scss';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PopularIcon from '@/icons/trend_up.svg';
import { logButtonClick } from '@/utils/eventLogger';

interface PopularButtonProps {
  onClick: () => void;
}

const PopularButton = ({ onClick }: PopularButtonProps) => {
  const { t } = useTranslation('home');

  const handleClick = () => {
    logButtonClick('home_popular');
    onClick();
  };

  return (
    <Button
      variant={ButtonVariant.Simplified}
      className={heroButtonStyles.button}
      onClick={handleClick}
      size={ButtonSize.Small}
      data-testid="popular-button"
    >
      <div className={heroButtonStyles.buttonContent}>
        <IconContainer size={IconSize.Xsmall} icon={<PopularIcon />} shouldForceSetColors={false} />
        <p className={heroButtonStyles.popularText}>{t('popular')}</p>
      </div>
    </Button>
  );
};

export default PopularButton;
