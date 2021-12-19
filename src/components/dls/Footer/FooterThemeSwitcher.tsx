import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';

import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import Button, { ButtonVariant } from '../Button/Button';
import PopoverMenu from '../PopoverMenu/PopoverMenu';

import styles from './FooterThemeSwitcher.module.scss';

import { themeIcons } from 'src/components/Navbar/SettingsDrawer/ThemeSection';
import { selectTheme, setTheme } from 'src/redux/slices/theme';
import ThemeType from 'src/redux/types/ThemeType';

const FooterThemeSwitcher = () => {
  const { lang, t } = useTranslation('common');
  const dispatch = useDispatch();

  const theme = useSelector(selectTheme, shallowEqual);

  const themes = Object.values(ThemeType).map((themeValue) => ({
    label: t(`themes.${themeValue}`),
    value: themeValue,
  }));

  return (
    <PopoverMenu
      trigger={
        <Button
          className={styles.triggerContainer}
          prefix={<span className={styles.iconContainer}>{themeIcons[theme.type]}</span>}
          tooltip={t('languages')}
          variant={ButtonVariant.Ghost}
          suffix={
            <span className={styles.suffixContainer}>
              <ChevronDownIcon />
            </span>
          }
        >
          {t(`themes.${theme.type}`)}
        </Button>
      }
    >
      {themes.map((option) => (
        <PopoverMenu.Item
          isSelected={option.value === lang}
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
