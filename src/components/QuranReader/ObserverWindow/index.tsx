import React from 'react';

import classNames from 'classnames';

import styles from './ObserverWindow.module.scss';

interface Props {
  isReadingMode: boolean;
}

const ObserverWindow: React.FC<Props> = ({ isReadingMode }) => {
  // don't show if we are on production or when we disable showing it.
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
    process.env.NEXT_PUBLIC_SHOW_OBSERVER_WINDOW === 'false'
  ) {
    return <></>;
  }
  return (
    <div
      className={classNames(styles.container, {
        [styles.readingMode]: isReadingMode,
      })}
    />
  );
};

export default ObserverWindow;
