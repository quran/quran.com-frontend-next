import React from 'react';

import classNames from 'classnames';

import styles from './SliderSplit.module.scss';

import { secondsFormatter } from 'src/utils/datetime';

type SplitProps = {
  isComplete: boolean;
  startTime: number;
  onClick: () => void;
};

export const NUMBER_OF_SPLITS = 100;

const SliderSplit = ({ isComplete, startTime, onClick }: SplitProps) => (
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  <span
    className={classNames(styles.split, { [styles.splitCompleted]: isComplete })}
    title={secondsFormatter(startTime)}
    onClick={() => onClick()}
    style={{ width: `${100 / NUMBER_OF_SPLITS}%` }}
  />
);

export default SliderSplit;
