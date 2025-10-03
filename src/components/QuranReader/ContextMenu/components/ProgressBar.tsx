import React from 'react';

import classNames from 'classnames';

import styles from '../styles/ProgressBar.module.scss';

interface ProgressBarProps {
  /**
   * The progress value (0-100)
   */
  progress: number;
  /**
   * Optional CSS class name to apply to the container
   */
  className?: string;
}

/**
 * ProgressBar component for displaying reading progress
 *
 * @param {ProgressBarProps} props - Component props
 * @returns {JSX.Element} The ProgressBar component
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className }) => {
  return (
    <div
      className={classNames(styles.container, className, { [styles.hide]: !progress })}
      data-testid="progress-bar"
      data-progress={progress}
    >
      <div className={styles.track}>
        <div className={styles.indicator} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
