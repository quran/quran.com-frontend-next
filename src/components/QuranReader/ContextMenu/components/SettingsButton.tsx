import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SettingsButton.module.scss';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import IconSettings from '@/icons/settings.svg';
import { setIsSettingsDrawerOpen } from '@/redux/slices/navbar';
import { selectReadingPreference } from '@/redux/slices/QuranReader/readingPreferences';
import { logEvent } from '@/utils/eventLogger';

interface SettingsButtonProps {
  className?: string;
  ariaId?: string;
  dataTestId?: string;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  className,
  ariaId = 'settings-button',
  dataTestId = 'settings-button',
}) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const readingPreference = useSelector(selectReadingPreference);
  const openSettings = () => {
    logEvent('drawer_settings_open');
    logEvent(`drawer_settings_opened_${readingPreference}`);
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
      data-testid={dataTestId}
    >
      <IconSettings className={styles.settingsButtonIcon} />
    </Button>
  );
};

export default SettingsButton;
