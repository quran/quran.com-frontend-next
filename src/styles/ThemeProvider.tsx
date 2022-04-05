import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import { selectIsBannerVisible } from 'src/redux/slices/banner';
import { selectTheme } from 'src/redux/slices/theme';

const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme, shallowEqual);
  const isBannerVisible = useSelector(selectIsBannerVisible);

  if (typeof window !== 'undefined' && document.body) {
    document.body.setAttribute('data-theme', theme.type);
  }

  return (
    <div
      className={classNames({
        'banner-active': isBannerVisible,
      })}
    >
      {children}
    </div>
  );
};

export default ThemeProvider;
