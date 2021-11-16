import classNames from 'classnames';

import styles from './Skeleton.module.scss';

type SkeletonProps = {
  children?: React.ReactNode;
  isRounded?: boolean;
  isSquared?: boolean;
  isActive?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

const Skeleton = ({
  children,
  isRounded,
  isSquared,
  isActive = true,
  style,
  className,
}: SkeletonProps) => {
  return (
    <span
      className={classNames(styles.skeleton, {
        [styles.baseSize]: !children,
        [styles.active]: isActive,
        [styles.rounded]: isRounded,
        [styles.squared]: isSquared,
        [className]: className,
      })}
      style={style}
    >
      {children}
    </span>
  );
};

export default Skeleton;
