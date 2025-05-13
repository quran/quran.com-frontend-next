import { ReactNode, FC } from 'react';

import classNames from 'classnames';

import styles from './PageContainer.module.scss';

type Props = {
  children: ReactNode | ReactNode[];
  isLessonView?: boolean;
};

const PageContainer: FC<Props> = ({ children, isLessonView = false }) => {
  return (
    <div
      className={classNames(styles.container, {
        [styles.lessonView]: isLessonView,
      })}
    >
      {children}
    </div>
  );
};

export default PageContainer;
