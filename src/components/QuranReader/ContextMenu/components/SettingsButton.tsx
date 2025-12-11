import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SettingsButton.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import IconSettings from '@/icons/settings.svg';
import {
  selectNavbar,
  setIsSettingsDrawerOpen,
  setSettingsOpenedFromScrolledState,
} from '@/redux/slices/navbar';
import { logEvent } from '@/utils/eventLogger';

interface SettingsButtonProps {
  className?: string;
  ariaId?: string;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  className,
  ariaId = 'settings-button',
}) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar);

  const openSettings = () => {
    logEvent('drawer_settings_open');
    if (!isNavbarVisible) {
      dispatch(setSettingsOpenedFromScrolledState(true));
    }
    dispatch(setIsSettingsDrawerOpen(true));
  };

  return (
    <Button
      className={className}
      tooltip={t('settings.title')}
      shape={ButtonShape.Circle}
      variant={ButtonVariant.Ghost}
      ariaLabel={t('aria.change-settings')}
      id={ariaId}
      onClick={openSettings}
    >
      <IconSettings className={styles.settingsButtonIcon} />
    </Button>
  );
};

export default SettingsButton;
