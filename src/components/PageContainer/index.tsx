import { ReactNode, FC } from 'react';

import classNames from 'classnames';

import styles from './PageContainer.module.scss';

type Props = {
  children: ReactNode | ReactNode[];
  isLessonView?: boolean;
  isSheetsLike?: boolean;
  className?: string;
};

const PageContainer: FC<Props> = ({
  children,
  isLessonView = false,
  isSheetsLike = false,
  className,
}) => {
  return (
    <div
      className={classNames(
        styles.container,
        {
          [styles.lessonView]: isLessonView,
          [styles.sheets]: isSheetsLike,
        },
        className,
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
