import React from 'react';

import styles from './DrawerSearchIcon.module.scss';

import { SearchIcon } from 'src/components/Icons';

const DrawerSearchIcon: React.FC = () => (
  <div className={styles.container}>
    <SearchIcon />
  </div>
);

export default DrawerSearchIcon;
