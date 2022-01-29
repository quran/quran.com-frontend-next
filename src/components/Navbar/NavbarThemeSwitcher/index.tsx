import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import styles from './NavbarThemeSwitcher.module.scss';

import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { themeIcons } from 'src/components/Navbar/SettingsDrawer/ThemeSection';
import { selectTheme, setTheme } from 'src/redux/slices/theme';
import ThemeType from 'src/redux/types/ThemeType';

const NavbarThemeSwitcher = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const theme = useSelector(selectTheme, shallowEqual);

  const themes = Object.values(ThemeType).map((themeValue) => ({
    label: t(`themes.${themeValue}`),
    value: themeValue,
  }));

  return (
    <PopoverMenu
      trigger={
        <Button shape={ButtonShape.Circle} tooltip={t('theme')} variant={ButtonVariant.Ghost}>
          <span className={styles.iconContainer}>{themeIcons[theme.type]}</span>
        </Button>
      }
    >
      {themes.map((option) => (
        <PopoverMenu.Item
          isSelected={option.value === theme.type}
          shouldCloseMenuAfterClick
          key={option.value}
          onClick={() => dispatch({ type: setTheme.type, payload: option.value })}
        >
          {option.label}
        </PopoverMenu.Item>
      ))}
    </PopoverMenu>
  );
};

export default NavbarThemeSwitcher;
