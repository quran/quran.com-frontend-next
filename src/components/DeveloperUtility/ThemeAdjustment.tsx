/* eslint-disable i18next/no-literal-string */
import React from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import { selectTheme, setTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';

const ThemeAdjustment = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme, shallowEqual);
  const availableThemes = [];

  Object.values(ThemeType).forEach((type) => availableThemes.push(type));

  return (
    <>
      <label htmlFor="theme-selector">
        Theme{' '}
        <select
          name="theme-selector"
          onChange={(event) => dispatch({ type: setTheme.type, payload: event.target.value })}
          value={theme.type}
        >
          {availableThemes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
    </>
  );
};

export default ThemeAdjustment;
