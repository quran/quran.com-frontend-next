import { ReactNode, FC } from 'react';

import classNames from 'classnames';

import styles from './PageContainer.module.scss';

export interface PageContainerProps {
  children: ReactNode | ReactNode[];
  isLessonView?: boolean;
  isSheetsLike?: boolean;
  wrapperClassName?: string;
  className?: string;
}

const PageContainer: FC<PageContainerProps> = ({
  children,
  isLessonView = false,
  isSheetsLike = false,
  wrapperClassName,
  className,
}) => {
  return (
    <div
      className={classNames(wrapperClassName, {
        [styles.wrapperSheets]: isSheetsLike,
      })}
    >
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
    </div>
  );
};

export default PageContainer;
