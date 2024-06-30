import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';
import styles from './ThemeSection.module.scss';

import Switch, { SwitchSize } from '@/dls/Switch/Switch';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import AutoIcon from '@/icons/auto.svg';
import MoonIcon from '@/icons/moon-outline.svg';
import SunIcon from '@/icons/sun-outline.svg';
import SunsetIcon from '@/icons/sunset.svg';
import { resetLoadedFontFaces } from '@/redux/slices/QuranReader/font-faces';
import { selectTheme, setTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import { logValueChange } from '@/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const themeIcons = {
  [ThemeType.Dark]: <MoonIcon />,
  [ThemeType.Light]: <SunIcon />,
  [ThemeType.Auto]: <AutoIcon />,
  [ThemeType.Sepia]: <SunsetIcon />,
};

const ThemeSection = () => {
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const theme = useSelector(selectTheme, shallowEqual);
  const themes = Object.values(ThemeType).map((themeValue) => ({
    name: (
      <div className={styles.container}>
        <span
          className={classNames(
            styles.iconContainer,
            theme.type === themeValue && styles.iconActive,
          )}
        >
          {themeIcons[themeValue]}
        </span>
        <span className={styles.themeNameContainer}>{t(`themes.${themeValue}`)}</span>
      </div>
    ),
    value: themeValue,
  }));

  const onThemeSelected = async (value: ThemeType) => {
    logValueChange('theme', theme.type, value);
    onSettingsChange('type', value, setTheme(value), setTheme(theme.type), PreferenceGroup.THEME);
    if (value !== theme.type) {
      // reset the loaded Fonts when we switch to a different theme
      dispatch(resetLoadedFontFaces());
    }
  };

  return (
    <Section id="theme-section">
      <Section.Title isLoading={isLoading}>{t('theme')}</Section.Title>
      <Section.Row>
        <Switch
          items={themes}
          selected={theme.type}
          onSelect={onThemeSelected}
          size={SwitchSize.Small}
        />
      </Section.Row>
      <Section.Footer visible={theme.type === ThemeType.Auto}>
        {t('themes.system-desc')}
      </Section.Footer>
    </Section>
  );
};

export default ThemeSection;
