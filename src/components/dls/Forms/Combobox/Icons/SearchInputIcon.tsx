import React from 'react';

import classNames from 'classnames';

import IconSearch from '../../../../../../public/icons/search.svg';

import styles from './SearchInputIcon.module.scss';

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
