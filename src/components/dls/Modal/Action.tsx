import React, { MouseEventHandler } from 'react';

import classNames from 'classnames';

import styles from './Action.module.scss';

type ActionProps = {
  children: React.ReactNode;
  onClick?: MouseEventHandler;
  isDisabled?: boolean;
  isPrimary?: boolean;
};

const Action = ({ children, onClick, isDisabled, isPrimary }: ActionProps) => (
  <button
    type="button"
    className={classNames(styles.action, {
      [styles.primary]: isPrimary,
    })}
    onClick={onClick}
    disabled={isDisabled}
  >
    {children}
  </button>
);

export default Action;
