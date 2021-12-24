/* eslint-disable react/no-multi-comp */

import classNames from 'classnames';

import styles from './ScrollArea.module.scss';

export enum Orientation {
  // VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

type ScrollAreaProps = {
  children: React.ReactNode;
  orientation: Orientation;
};

const ScrollArea = ({ children, orientation }: ScrollAreaProps) => {
  return (
    <div
      className={classNames(styles.scrollArea, {
        [styles.horizontalScroll]: orientation === Orientation.HORIZONTAL,
        // [styles.verticalScroll]: orientation === Orientation.VERTICAL,
      })}
    >
      {children}
    </div>
  );
};

export default ScrollArea;
