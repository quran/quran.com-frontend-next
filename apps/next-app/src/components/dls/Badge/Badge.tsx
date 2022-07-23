import classNames from 'classnames';

import styles from './Badge.module.scss';

type BadeProps = {
  content: React.ReactNode;
  children: React.ReactNode;
};

const Badge = ({ content, children }: BadeProps) => {
  return (
    <div className={styles.container}>
      {children}
      <div className={classNames(styles.content, styles.positionBottomRight)}>{content}</div>
    </div>
  );
};

export default Badge;
