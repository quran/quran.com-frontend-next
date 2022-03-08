import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import useScrollDirection, { ScrollDirection } from 'src/hooks/useScrollDirection';
import { setIsMobileMinimizedForScrolling } from 'src/redux/slices/AudioPlayer/state';
import { setIsVisible } from 'src/redux/slices/navbar';
import { setIsExpanded } from 'src/redux/slices/QuranReader/contextMenu';
import { setShowScrollToTop } from 'src/redux/slices/QuranReader/scrollToTop';

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
        dispatch({ type: setIsMobileMinimizedForScrolling.type, payload: true });
        dispatch({ type: setIsExpanded.type, payload: false });
        dispatch({ type: setIsVisible.type, payload: false });
        dispatch({ type: setShowScrollToTop.type, payload: true });
      } else if (newYPosition >= 0 && direction === ScrollDirection.Up) {
        dispatch({ type: setIsMobileMinimizedForScrolling.type, payload: false });
        dispatch({ type: setIsExpanded.type, payload: true });
        dispatch({ type: setIsVisible.type, payload: true });
      }

      if (newYPosition <= 50 && direction === ScrollDirection.Up)
        dispatch({ type: setShowScrollToTop.type, payload: false });
    },
    [dispatch],
  );
  useScrollDirection(onDirectionChange);
  return <></>;
};

export default GlobalScrollListener;
