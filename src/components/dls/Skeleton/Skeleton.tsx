import classNames from 'classnames';

import styles from './Skeleton.module.scss';

type SkeletonProps = {
  children?: React.ReactNode;
  isRounded?: boolean;
  isSquared?: boolean;
  isActive?: boolean;
};

const Skeleton = ({ children, isRounded, isSquared, isActive = true }: SkeletonProps) => {
  return (
    <span
      className={classNames(styles.skeleton, {
        [styles.baseSize]: !children,
        [styles.active]: isActive,
        [styles.rounded]: isRounded,
        [styles.squared]: isSquared,
      })}
    >
      {children}
    </span>
  );
};

export default Skeleton;
