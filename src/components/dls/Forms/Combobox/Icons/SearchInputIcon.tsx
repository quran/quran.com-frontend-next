import React from 'react';

import classNames from 'classnames';

import styles from './SearchInputIcon.module.scss';

import { SearchIcon } from 'src/components/Icons';

const SearchInputIcon: React.FC = () => (
  <span
    className={classNames(styles.iconContainer, styles.selectSearch)}
    unselectable="on"
    aria-hidden="true"
  >
    <span role="img" className={styles.icon}>
      <SearchIcon />
    </span>
  </span>
);

export default SearchInputIcon;
