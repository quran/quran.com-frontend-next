import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import CircleIcon from '../../../../public/icons/circle.svg';
import MoonIcon from '../../../../public/icons/moon-outline.svg';
import SunIcon from '../../../../public/icons/sun-outline.svg';

import Section from './Section';
import styles from './ThemeSection.module.scss';

import Switch from 'src/components/dls/Switch/Switch';
import { selectTheme, setTheme } from 'src/redux/slices/theme';
import ThemeType from 'src/redux/types/ThemeType';

const icons = {
  [ThemeType.Dark]: <MoonIcon />,
  [ThemeType.Light]: <SunIcon />,
  [ThemeType.Auto]: <CircleIcon />,
};

const ThemeSection = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const theme = useSelector(selectTheme, shallowEqual);
  const themes = Object.values(ThemeType).map((themeValue) => ({
    name: (
      <span className={styles.container}>
        {theme.type === themeValue && icons[themeValue]}
        {t(`themes.${themeValue}`)}
      </span>
    ),
    value: themeValue,
  }));

  return (
    <Section>
      <Section.Title>{t('theme')}</Section.Title>
      <Section.Row>
        <Switch
          items={themes}
          selected={theme.type}
          onSelect={(value) => dispatch({ type: setTheme.type, payload: value })}
        />
      </Section.Row>
      <Section.Footer visible={theme.type === ThemeType.Auto}>
        {t('themes.system-desc')}
      </Section.Footer>
    </Section>
  );
};

export default ThemeSection;
