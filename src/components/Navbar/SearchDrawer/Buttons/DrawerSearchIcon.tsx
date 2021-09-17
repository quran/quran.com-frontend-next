import React from 'react';

import IconSearch from '../../../../../public/icons/search.svg';

import styles from './DrawerSearchIcon.module.scss';

const DrawerSearchIcon: React.FC = () => (
  <div className={styles.container}>
    <IconSearch />
  </div>
);

export default DrawerSearchIcon;
