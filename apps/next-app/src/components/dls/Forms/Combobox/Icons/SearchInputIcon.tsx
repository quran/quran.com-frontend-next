import React from 'react';

import classNames from 'classnames';

import { FiSearch } from 'react-icons/fi';

import styles from './SearchInputIcon.module.scss';

const SearchInputIcon: React.FC = () => (
  <span
    className={classNames(styles.iconContainer, styles.selectSearch)}
    unselectable="on"
    aria-hidden="true"
  >
    <span role="img" className={styles.icon}>
      <FiSearch />
    </span>
  </span>
);

export default SearchInputIcon;
