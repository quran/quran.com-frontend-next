import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import Section from './Section';

import Select from 'src/components/dls/Forms/Select';
import { selectTheme, setTheme } from 'src/redux/slices/theme';
import ThemeType from 'src/redux/types/ThemeType';

const ThemeSection = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('common');
  const theme = useSelector(selectTheme, shallowEqual);
  const themes = useMemo(
    () =>
      Object.values(ThemeType).map((themeValue) => ({
        label: t(`themes.${themeValue}`),
        value: themeValue,
      })),
    [t],
  );
  return (
    <Section>
      <Section.Title>{t('theme')}</Section.Title>
      <Section.Row>
        <Section.Label>{t('mode')}</Section.Label>
        <Select
          id="theme-section"
          name="theme"
          options={themes}
          value={theme.type}
          onChange={(value) => dispatch({ type: setTheme.type, payload: value })}
        />
      </Section.Row>
      <Section.Footer visible={theme.type === ThemeType.System}>
        {t('themes.system-desc')}
      </Section.Footer>
    </Section>
  );
};

export default ThemeSection;
