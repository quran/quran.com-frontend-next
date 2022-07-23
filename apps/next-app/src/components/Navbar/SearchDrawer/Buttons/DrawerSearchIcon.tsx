import React from 'react';

import { FiSearch } from 'react-icons/fi';

import styles from './DrawerSearchIcon.module.scss';

const DrawerSearchIcon: React.FC = () => (
  <div className={styles.container}>
    <FiSearch />
  </div>
);

export default DrawerSearchIcon;
