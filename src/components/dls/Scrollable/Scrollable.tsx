import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../Button/Button';

import styles from './Scrollable.module.scss';

import useScrollable from '@/hooks/useScrollable';
import ChevronLeftIcon from '@/icons/chevron-left.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { isRTLLocale } from '@/utils/locale';

interface ScrollableProps {
  children: React.ReactNode;
  indicatorOnly?: boolean;
  className?: string;
  containerClassName?: string;
  edgeClassName?: string;
  leftEdgeClassName?: string;
  rightEdgeClassName?: string;
  edgeButtonClassName?: string;
  leftEdgeButtonClassName?: string;
  rightEdgeButtonClassName?: string;
  eventName: string;
}

const Scrollable = ({
  children,
  indicatorOnly = false,
  className,
  containerClassName,
  edgeClassName,
  leftEdgeClassName,
  rightEdgeClassName,
  edgeButtonClassName,
  leftEdgeButtonClassName,
  rightEdgeButtonClassName,
  eventName,
}: ScrollableProps) => {
  const { lang } = useTranslation();
  const isRTL = isRTLLocale(lang);

  const { containerRef, leftButtonRef, rightButtonRef, onLeftButtonClick, onRightButtonClick } =
    useScrollable({
      isRTL,
      hiddenClassName: styles.hiddenEdge,
      indicatorOnly,
      childrenCount: React.Children.count(children),
    });

  const handleLeftButtonClick = () => {
    onLeftButtonClick();
    logButtonClick(`${eventName}_left`);
  };

  const handleRightButtonClick = () => {
    onRightButtonClick();
    logButtonClick(`${eventName}_right`);
  };

  return (
    <div className={classNames(styles.container, containerClassName)}>
      <div
        className={classNames(styles.edge, styles.leftEdge, edgeClassName, leftEdgeClassName, {
          [styles.edgeIndicatorOnly]: indicatorOnly,
        })}
        ref={leftButtonRef}
      >
        <Button
          className={classNames(
            styles.edgeButton,
            styles.leftEdgeButton,
            edgeButtonClassName,
            leftEdgeButtonClassName,
          )}
          onClick={handleLeftButtonClick}
          size={ButtonSize.XXSmall}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Compact}
          shouldFlipOnRTL={false}
        >
          <ChevronLeftIcon />
        </Button>
      </div>
      <div ref={containerRef} className={classNames(styles.children, className)}>
        {children}
      </div>
      <div
        className={classNames(styles.edge, styles.rightEdge, edgeClassName, rightEdgeClassName, {
          [styles.edgeIndicatorOnly]: indicatorOnly,
        })}
        ref={rightButtonRef}
      >
        <Button
          className={classNames(
            styles.edgeButton,
            styles.edgeButtonRight,
            edgeButtonClassName,
            rightEdgeButtonClassName,
          )}
          onClick={handleRightButtonClick}
          size={ButtonSize.XXSmall}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Compact}
          shouldFlipOnRTL={false}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
};

export default Scrollable;
