import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import useScrollDirection, { ScrollDirection } from 'src/hooks/useScrollDirection';
import { setIsVisible } from 'src/redux/slices/navbar';
import { setIsExpanded } from 'src/redux/slices/QuranReader/contextMenu';

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
        dispatch({ type: setIsExpanded.type, payload: false });
        dispatch({ type: setIsVisible.type, payload: false });
      } else if (newYPosition >= 0 && direction === ScrollDirection.Up) {
        dispatch({ type: setIsExpanded.type, payload: true });
        dispatch({ type: setIsVisible.type, payload: true });
      }
    },
    [dispatch],
  );
  useScrollDirection(onDirectionChange);
  return <></>;
};

export default GlobalScrollListener;
