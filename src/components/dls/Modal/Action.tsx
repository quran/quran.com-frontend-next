import React, { MouseEventHandler } from 'react';

import styles from './Action.module.scss';

type ActionProps = {
  children: React.ReactNode;
  onClick?: MouseEventHandler;
  isDisabled?: boolean;
};

const Action = ({ children, onClick, isDisabled }: ActionProps) => (
  <button type="button" className={styles.action} onClick={onClick} disabled={isDisabled}>
    {children}
  </button>
);

export default Action;
