/* eslint-disable react/no-unknown-property */
import React from 'react';

import classNames from 'classnames';

import styles from './SearchInputIcon.module.scss';

import IconSearch from '@/icons/search.svg';

const SearchInputIcon: React.FC = () => (
  <span
    className={classNames(styles.iconContainer, styles.selectSearch)}
    unselectable="on"
    aria-hidden="true"
  >
    <span role="img" className={styles.icon}>
      <IconSearch />
    </span>
  </span>
);

export default SearchInputIcon;
