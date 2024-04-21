import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import useScrollDirection, { ScrollDirection } from '@/hooks/useScrollDirection';
import { setIsVisible } from '@/redux/slices/navbar';
import {
  setIsExpanded,
  setShowReadingPreferenceSwitcher,
} from '@/redux/slices/QuranReader/contextMenu';
import OnboardingGroup from '@/types/OnboardingGroup';

const GlobalScrollListener = () => {
  const dispatch = useDispatch();
  const { isActive, activeStepGroup } = useOnboarding();
  const onDirectionChange = useCallback(
    (direction: ScrollDirection, newYPosition: number) => {
      // if we are in the Quran Reader, disable default scroll behavior to avoid having 2 preference switchers {@see: <ReadingPreferenceSwitcher}
      if (isActive && activeStepGroup === OnboardingGroup.READING_EXPERIENCE) {
        return;
      }
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
      if (newYPosition > 150 && direction === ScrollDirection.Down) {
        dispatch({ type: setShowReadingPreferenceSwitcher.type, payload: true });
      } else if (newYPosition <= 150 && direction === ScrollDirection.Up) {
        dispatch({ type: setShowReadingPreferenceSwitcher.type, payload: false });
      }
    },
    [activeStepGroup, dispatch, isActive],
  );
  useScrollDirection(onDirectionChange);
  return <></>;
};

export default GlobalScrollListener;
