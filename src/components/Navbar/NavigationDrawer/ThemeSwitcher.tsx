import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './ThemeSwitcher.module.scss';

import { themeIcons } from '@/components/Navbar/SettingsDrawer/ThemeSection';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PopoverMenu, { PopoverMenuExpandDirection } from '@/dls/PopoverMenu/PopoverMenu';
import Spinner from '@/dls/Spinner/Spinner';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { resetLoadedFontFaces } from '@/redux/slices/QuranReader/font-faces';
import { selectTheme, setTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import { TestId } from '@/tests/test-ids';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
import { logEvent, logValueChange } from '@/utils/eventLogger';

const ThemeSwitcher = () => {
  const { t } = useTranslation('common');
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme, shallowEqual);

  const themes = Object.values(ThemeType).map((themeValue) => ({
    label: t(`themes.${themeValue}`),
    value: themeValue,
  }));

  const onOpenChange = (open: boolean) => {
    if (open) {
      logEvent('navigation_drawer_theme_selector_open');
      return;
    }
    logEvent('navigation_drawer_theme_selector_close');
  };

  const onThemeSelected = (value: ThemeType) => {
    logValueChange('theme', theme.type, value);
    onSettingsChange('type', value, setTheme(value), setTheme(theme.type), PreferenceGroup.THEME);
    if (value !== theme.type) {
      // reset the loaded Fonts when we switch to a different theme
      dispatch(resetLoadedFontFaces());
    }
  };

  return (
    <PopoverMenu
      onOpenChange={onOpenChange}
      expandDirection={PopoverMenuExpandDirection.TOP}
      contentClassName={styles.popoverContent}
      isPortalled={false}
      isModal={false}
      trigger={
        <Button
          className={styles.triggerContainer}
          prefix={isLoading ? <Spinner /> : themeIcons[theme.type]}
          variant={ButtonVariant.Ghost}
          size={ButtonSize.Small}
          shape={ButtonShape.Pill}
          data-testid={TestId.CHANGE_THEME_BUTTON}
        >
          {t('change-theme')}
        </Button>
      }
    >
      {themes.map((option, index) => (
        <React.Fragment key={option.value}>
          <PopoverMenu.Item
            isSelected={option.value === theme.type}
            shouldCloseMenuAfterClick
            onClick={() => onThemeSelected(option.value)}
            className={classNames(styles.popoverItem, {
              [styles.popoverItemSelected]: option.value === theme.type,
            })}
            icon={themeIcons[option.value]}
            dataTestId={`theme-option-${option.value}`}
          >
            {option.label}
          </PopoverMenu.Item>
          {index < themes.length - 1 && <PopoverMenu.Divider />}
        </React.Fragment>
      ))}
    </PopoverMenu>
  );
};

export default ThemeSwitcher;
