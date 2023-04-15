import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import Button, { ButtonVariant } from '../Button/Button';
import PopoverMenu from '../PopoverMenu/PopoverMenu';

import styles from './FooterThemeSwitcher.module.scss';

import { themeIcons } from '@/components/Navbar/SettingsDrawer/ThemeSection';
import ChevronSelectIcon from '@/icons/chevron-select.svg';
import { selectTheme, setTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import { logEvent } from '@/utils/eventLogger';

const FooterThemeSwitcher = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const theme = useSelector(selectTheme, shallowEqual);

  const themes = Object.values(ThemeType).map((themeValue) => ({
    label: t(`themes.${themeValue}`),
    value: themeValue,
  }));

  const onOpenChange = (open: boolean) => {
    if (open) {
      logEvent(`footer_theme_selector_open`);
      return;
    }
    logEvent(`footer_theme_selector_close`);
  };

  return (
    <PopoverMenu
      onOpenChange={onOpenChange}
      trigger={
        <Button
          className={styles.triggerContainer}
          prefix={<span className={styles.iconContainer}>{themeIcons[theme.type]}</span>}
          tooltip={t('theme')}
          variant={ButtonVariant.Ghost}
          suffix={
            <span className={styles.suffixIconContainer}>
              <ChevronSelectIcon />
            </span>
          }
        >
          {t(`themes.${theme.type}`)}
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

export default FooterThemeSwitcher;
