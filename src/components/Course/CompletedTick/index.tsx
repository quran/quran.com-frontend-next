import React from 'react';

import styles from './CompletedTick.module.scss';

import TickIcon from '@/icons/tick.svg';

const CompletedTick = () => {
  return (
    <span className={styles.icon}>
      <TickIcon />
    </span>
  );
};

export default CompletedTick;
