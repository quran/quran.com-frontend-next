import React, { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import useIsMobile from '@/hooks/useIsMobile';
import useScrollDirection, { ScrollDirection } from '@/hooks/useScrollDirection';
import { setIsVisible, selectNavbar } from '@/redux/slices/navbar';
import {
  setIsExpanded,
  setShowReadingPreferenceSwitcher,
} from '@/redux/slices/QuranReader/contextMenu';
import OnboardingGroup from '@/types/OnboardingGroup';

const GlobalScrollListener = () => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const { isActive, activeStepGroup } = useOnboarding();
  const { lockVisibilityState } = useSelector(selectNavbar);
  const onDirectionChange = useCallback(
    (direction: ScrollDirection, newYPosition: number) => {
      // if we are in the Quran Reader, disable default scroll behavior to avoid having 2 preference switchers {@see: <ReadingPreferenceSwitcher}
      if (isActive && activeStepGroup === OnboardingGroup.READING_EXPERIENCE) {
        return;
      }

      if (isMobile) {
        // MOBILE: Asymmetric thresholds for smooth handoff with MobileStickyItemsBar
        // - Hide early on scroll-down (10px) to prevent content jump
        // - Show early on scroll-up (75px) to allow smooth handoff
        const HIDE_THRESHOLD = 10;
        const SHOW_THRESHOLD = 75;

        const isScrollingUp = direction === ScrollDirection.Up;
        const threshold = isScrollingUp ? SHOW_THRESHOLD : HIDE_THRESHOLD;
        const isAtTop = newYPosition <= threshold;

        dispatch({ type: setIsExpanded.type, payload: isAtTop });
        if (!lockVisibilityState) {
          dispatch({ type: setIsVisible.type, payload: isAtTop });
        }
      } else if (newYPosition > 50 && direction === ScrollDirection.Down) {
        // DESKTOP: Direction-based logic - hide on scroll down
        dispatch({ type: setIsExpanded.type, payload: false });
        if (!lockVisibilityState) {
          dispatch({ type: setIsVisible.type, payload: false });
        }
      } else if (newYPosition >= 0 && direction === ScrollDirection.Up) {
        // DESKTOP: Direction-based logic - show on scroll up
        dispatch({ type: setIsExpanded.type, payload: true });
        if (!lockVisibilityState) {
          dispatch({ type: setIsVisible.type, payload: true });
        }
      }

      // Reading preference switcher logic (unchanged - applies to both mobile and desktop)
      if (newYPosition > 150 && direction === ScrollDirection.Down) {
        dispatch({ type: setShowReadingPreferenceSwitcher.type, payload: true });
      } else if (newYPosition <= 150 && direction === ScrollDirection.Up) {
        dispatch({ type: setShowReadingPreferenceSwitcher.type, payload: false });
      }
    },
    [isMobile, activeStepGroup, dispatch, isActive, lockVisibilityState],
  );
  useScrollDirection(onDirectionChange);
  return <></>;
};

export default GlobalScrollListener;
