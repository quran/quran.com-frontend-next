import React from 'react';

import classNames from 'classnames';

import styles from './ObserverWindow.module.scss';

interface Props {
  isReadingMode: boolean;
}

const DebuggingObserverWindow: React.FC<Props> = ({ isReadingMode }) => {
  if (process.env.NEXT_PUBLIC_DEBUG_OBSERVER_WINDOW !== 'true') {
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

export default DebuggingObserverWindow;
