/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';

import styles from './Bismillah.module.scss';

export enum BismillahSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

type BismillahProps = {
  size?: BismillahSize;
};

const Bismillah = ({ size = BismillahSize.Medium }: BismillahProps) => (
  <span
    className={classNames(styles.bismillah, {
      [styles.bismillahSmall]: size === BismillahSize.Small,
      [styles.bismillahLarge]: size === BismillahSize.Large,
    })}
  >
    ﷽
  </span>
);

export default Bismillah;
