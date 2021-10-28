import classNames from 'classnames';

import styles from './Skeleton.module.scss';

type SkeletonProps = {
  children?: React.ReactNode;
  className?: string;
  isRounded?: boolean;
  isSquared?: boolean;
  width?: number | string;
  height?: number | string;
  isActive?: boolean;
};

const defaultHeight = 40;
const defaultWidth = 40;
const Skeleton = ({
  children,
  isRounded,
  isSquared,
  width,
  height,
  isActive = true,
}: SkeletonProps) => {
  return (
    <span
      style={{
        // use default width and height if (no children && no specified height)
        width: !children && !width ? defaultWidth : null,
        height: !children && !height ? defaultHeight : null,
      }}
      className={classNames(styles.skeleton, {
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
