import React, { MouseEventHandler } from 'react';

import classNames from 'classnames';

import styles from './Action.module.scss';

type ActionProps = {
  children: React.ReactNode;
  onClick?: MouseEventHandler;
  isDisabled?: boolean;
  isPrimary?: boolean;
  dataTestId?: string;
};

const Action = ({ children, onClick, isDisabled, isPrimary, dataTestId }: ActionProps) => (
  <button
    type="button"
    className={classNames(styles.action, {
      [styles.primary]: isPrimary,
    })}
    onClick={onClick}
    disabled={isDisabled}
    data-testid={dataTestId}
  >
    {children}
  </button>
);

export default Action;
