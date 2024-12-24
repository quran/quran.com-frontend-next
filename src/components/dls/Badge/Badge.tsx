import classNames from 'classnames';

import styles from './Badge.module.scss';

export enum BadgePosition {
  TOP_LEFT = 'top-left',
  BOTTOM_RIGHT = 'bottom-right',
}

type BadeProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  className?: string;
  position?: BadgePosition;
};

const Badge = ({
  content,
  children,
  contentClassName,
  className,
  position = BadgePosition.BOTTOM_RIGHT,
}: BadeProps) => {
  return (
    <div className={classNames(styles.container, className)}>
      {children}
      <div
        className={classNames(contentClassName, styles.content, {
          [styles.topLeft]: position === BadgePosition.TOP_LEFT,
          [styles.bottomRight]: position === BadgePosition.BOTTOM_RIGHT,
        })}
      >
        {content}
      </div>
    </div>
  );
};

export default Badge;
