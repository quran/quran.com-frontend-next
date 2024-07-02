import classNames from 'classnames';

import styles from './Skeleton.module.scss';

type SkeletonProps = {
  children?: React.ReactNode;
  isRounded?: boolean;
  isSquared?: boolean;
  isActive?: boolean;
  className?: string;
};

const Skeleton = ({
  children,
  isRounded,
  isSquared,
  isActive = true,
  className,
}: SkeletonProps) => {
  return (
    <span
      className={classNames(styles.skeleton, {
        [styles.baseSize]: !children && !className,
        [styles.active]: isActive,
        [styles.rounded]: isRounded,
        [styles.squared]: isSquared,
        [className]: className,
      })}
    >
      {children && <span className={styles.content}>{children}</span>}
    </span>
  );
};

export default Skeleton;
