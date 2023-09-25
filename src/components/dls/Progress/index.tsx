import * as RadixProgress from '@radix-ui/react-progress';
import classNames from 'classnames';

import styles from './Progress.module.scss';

export enum ProgressSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface ProgressProps {
  value: number;
  size?: ProgressSize;
  rootStyles?: string;
  indicatorStyles?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  rootStyles,
  size = ProgressSize.Small,
  indicatorStyles,
}) => {
  const rootClassNames = classNames(
    styles.progressRoot,
    {
      [styles.progressSmall]: size === ProgressSize.Small,
      [styles.progressMedium]: size === ProgressSize.Medium,
      [styles.progressLarge]: size === ProgressSize.Large,
    },
    rootStyles,
  );

  return (
    <RadixProgress.Root className={rootClassNames} value={value}>
      <RadixProgress.Indicator
        className={classNames(styles.progressIndicator, indicatorStyles)}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </RadixProgress.Root>
  );
};

export default Progress;
