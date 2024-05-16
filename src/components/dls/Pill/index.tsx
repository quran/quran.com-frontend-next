import React from 'react';

import classNames from 'classnames';

import styles from './Pill.module.scss';

export enum PillSize {
  SMALL = 'small',
  MEDIUM = 'medium',
}

type Props = {
  children: React.ReactNode;
  size?: PillSize;
};

const Pill: React.FC<Props> = ({ children, size = PillSize.MEDIUM }) => {
  return (
    <div
      className={classNames(styles.container, {
        [styles.medium]: size === PillSize.MEDIUM,
        [styles.small]: size === PillSize.SMALL,
      })}
    >
      {children}
    </div>
  );
};

export default Pill;
