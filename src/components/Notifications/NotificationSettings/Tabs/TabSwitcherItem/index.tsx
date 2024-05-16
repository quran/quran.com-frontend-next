import React from 'react';

import styles from './TabSwitcherItem.module.scss';

type Props = {
  value: string;
};

// TODO: move this to a standalone component called Tabs
const TabSwitcherItem: React.FC<Props> = ({ value }) => {
  return <p className={styles.value}>{value}</p>;
};

export default TabSwitcherItem;
