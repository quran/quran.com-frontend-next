import React from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import classNames from 'classnames';

import styles from './Content.module.scss';

const Content = ({
  children,
  isPropagationStopped,
  isBottomSheetOnMobile,
  contentClassName,
  ...props
}) => (
  <DialogPrimitive.Content
    {...props}
    className={classNames(
      styles.content,
      { [styles.topSheetOnMobile]: !isBottomSheetOnMobile },
      contentClassName,
    )}
    onClick={(e) => {
      /**
       * Radix is using react portal,
       * React Portal bubble events events to the parent element,
       * even if they are not in the same DOM Tree, for us this could
       * cause problems. For example, calling Modal inside AudioPlayer
       * could cause the AudioPlayer to `expand` / `minimize`
       *
       * References:
       * - https://reactjs.org/docs/portals.html#event-bubbling-through-portals
       * - https://jwwnz.medium.com/react-portals-and-event-bubbling-8df3e35ca3f1
       */
      if (isPropagationStopped) e.stopPropagation();
    }}
  >
    {children}
  </DialogPrimitive.Content>
);

export default Content;
