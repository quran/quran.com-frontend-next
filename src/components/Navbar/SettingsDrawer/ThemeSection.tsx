import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { FiClock, FiMoon, FiSun, FiSunset } from 'react-icons/fi';
import { shallowEqual, useSelector } from 'react-redux';

import Section from './Section';
import styles from './ThemeSection.module.scss';

import Switch, { SwitchSize } from 'src/components/dls/Switch/Switch';
import usePersistPreferenceGroup from 'src/hooks/auth/usePersistPreferenceGroup';
import { selectTheme, setTheme } from 'src/redux/slices/theme';
import ThemeType from 'src/redux/types/ThemeType';
import { logValueChange } from 'src/utils/eventLogger';
import PreferenceGroup from 'types/auth/PreferenceGroup';

export const themeIcons = {
  [ThemeType.Dark]: <FiMoon />,
  [ThemeType.Light]: <FiSun />,
  [ThemeType.Auto]: <FiClock />,
  [ThemeType.Sepia]: <FiSunset />,
};

const ThemeSection = () => {
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();
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
  };

  return (
    <Section>
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
