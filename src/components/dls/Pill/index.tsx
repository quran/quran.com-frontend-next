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
  containerClassName?: string;
};

const Pill: React.FC<Props> = ({ children, size = PillSize.MEDIUM, containerClassName }) => {
  return (
    <div
      className={classNames(containerClassName, styles.container, {
        [styles.medium]: size === PillSize.MEDIUM,
        [styles.small]: size === PillSize.SMALL,
      })}
    >
      {children}
    </div>
  );
};

export default Pill;
