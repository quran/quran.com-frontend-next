import React from 'react';

import styles from './TabSwitcherItem.module.scss';

type Props = {
  icon: React.ReactElement;
  value: string;
};

// TODO: move this to a standalone component called Tabs
const TabSwitcherItem: React.FC<Props> = ({ icon, value }) => {
  return (
    <div className={styles.container}>
      {icon} <p className={styles.value}>{value}</p>
    </div>
  );
};

export default TabSwitcherItem;
