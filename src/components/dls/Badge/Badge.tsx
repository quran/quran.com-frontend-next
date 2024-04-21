import classNames from 'classnames';

import styles from './Badge.module.scss';

type BadeProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  className?: string;
};

const Badge = ({ content, children, contentClassName, className }: BadeProps) => {
  return (
    <div className={classNames(styles.container, className)}>
      {children}
      <div className={classNames(contentClassName, styles.content, styles.positionBottomRight)}>
        {content}
      </div>
    </div>
  );
};

export default Badge;
