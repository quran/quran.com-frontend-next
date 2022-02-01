import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import AutoIcon from '../../../../public/icons/auto.svg';
import MoonIcon from '../../../../public/icons/moon-outline.svg';
import SunIcon from '../../../../public/icons/sun-outline.svg';
import SunsetIcon from '../../../../public/icons/sunset.svg';

import Section from './Section';
import styles from './ThemeSection.module.scss';

import Switch, { SwitchSize } from 'src/components/dls/Switch/Switch';
import { selectTheme, setTheme } from 'src/redux/slices/theme';
import ThemeType from 'src/redux/types/ThemeType';
import { logValueChange } from 'src/utils/eventLogger';

export const themeIcons = {
  [ThemeType.Dark]: <MoonIcon />,
  [ThemeType.Light]: <SunIcon />,
  [ThemeType.Auto]: <AutoIcon />,
  [ThemeType.Sepia]: <SunsetIcon />,
};

const ThemeSection = () => {
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

  const onThemeSelected = (value) => {
    logValueChange('theme', theme.type, value);
    dispatch({ type: setTheme.type, payload: value });
  };

  return (
    <Section>
      <Section.Title>{t('theme')}</Section.Title>
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
