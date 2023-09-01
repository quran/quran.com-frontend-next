import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import useScrollDirection, { ScrollDirection } from '@/hooks/useScrollDirection';
import { setIsVisibleAction } from '@/redux/slices/navbar';
import { setIsExpandedAction } from '@/redux/slices/QuranReader/contextMenu';

const GlobalScrollListener = () => {
  const dispatch = useDispatch();
  const onDirectionChange = useCallback(
    (direction: ScrollDirection, newYPosition: number) => {
      /**
       * We need to only accept when the new position is >= 0 because on mobile, if the user swipes up
       * and the scroll bar passes the uppermost part of the viewport, the new y position becomes below
       * zero then the browser forces the view to go to exactly 0 again so the hook detects it's
       * a down direction and hides the navbar, context menu and audioPlayer.
       */
      if (newYPosition > 50 && direction === ScrollDirection.Down) {
        dispatch(setIsExpandedAction(false));

        dispatch(setIsVisibleAction(false));
      } else if (newYPosition >= 0 && direction === ScrollDirection.Up) {
        dispatch(setIsExpandedAction(true));
        dispatch(setIsVisibleAction(true));
      }
    },
    [dispatch],
  );
  useScrollDirection(onDirectionChange);
  return <></>;
};

export default GlobalScrollListener;
