import React from 'react';

import styles from './DrawerSearchIcon.module.scss';

import IconSearch from '@/icons/search.svg';

const DrawerSearchIcon: React.FC = () => (
  <div className={styles.container}>
    <IconSearch />
  </div>
);

export default DrawerSearchIcon;
