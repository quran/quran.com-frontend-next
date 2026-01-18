import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './PopularDropdown.module.scss';

import PlayRadioButton from '@/components/HomePage/PlayRadioButton';
import QuickLinks from '@/components/HomePage/QuickLinks';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import CloseIcon from '@/icons/close.svg';
import PopularIcon from '@/icons/trend_up.svg';
import { TestId } from '@/tests/test-ids';
import { logButtonClick } from '@/utils/eventLogger';

interface PopularDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const PopularDropdown = ({ isOpen, onClose }: PopularDropdownProps) => {
  const { t } = useTranslation('home');

  const onCloseClicked = () => {
    logButtonClick('home_popular_close');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.dropdownContainer} data-testid={TestId.QUICK_LINKS}>
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
  );
};

export default PopularDropdown;
