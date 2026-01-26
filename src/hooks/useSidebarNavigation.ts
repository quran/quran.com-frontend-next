import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { selectIsPersistGateHydrationComplete } from '@/redux/slices/persistGateHydration';
import {
  IsSidebarNavigationVisible,
  selectIsSidebarNavigationVisible,
  setIsSidebarNavigationVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
import { getSidebarTransitionDurationFromCss } from '@/utils/css';
import { isQuranReaderRoute } from '@/utils/navigation';

export type SidebarNavigationState = {
  /** Whether the current route is a Quran reader route where sidebar is applicable */
  isQuranReaderRoute: boolean;
  /** Whether the sidebar should be rendered (includes transition states) */
  shouldRenderSidebar: boolean;
  /** Whether the sidebar is currently visible (from Redux state) - can be boolean or 'auto' */
  isSidebarVisible: IsSidebarNavigationVisible;
};

/**
 * Hook that manages sidebar navigation state and animation timing.
 *
 * This hook handles:
 * 1. Route-based visibility - disables sidebar on non-Quran reader routes
 * 2. Animation timing - keeps sidebar mounted during CSS transitions
 * 3. Hydration reset - ensures sidebar state is correct after Redux hydration
 *
 * The `shouldRenderSidebar` value accounts for:
 * - Current route (always render on Quran reader pages)
 * - Visibility state (render when actively visible)
 * - Closing animation (keep mounted during transition)
 *
 * @returns {SidebarNavigationState} Sidebar navigation state
 */
const useSidebarNavigation = (): SidebarNavigationState => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux state
  const isSidebarVisible = useSelector(selectIsSidebarNavigationVisible);
  const isPersistHydrationComplete = useSelector(selectIsPersistGateHydrationComplete);

  // Route detection
  const isOnQuranReaderRoute = isQuranReaderRoute(router.pathname);
  const normalizedPathname = router.asPath.split(/[?#]/)[0];

  // Animation state
  const [isSidebarClosing, setIsSidebarClosing] = useState(false);
  const sidebarVisibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousSidebarVisibilityRef = useRef(isSidebarVisible);
  const hasResetSidebarAfterHydration = useRef(false);

  // Get transition duration from CSS variables
  const sidebarTransitionDuration = getSidebarTransitionDurationFromCss();

  // Detect transition from visible to hidden (visible can be true or 'auto')
  const wasSidebarVisible = !!previousSidebarVisibilityRef.current;
  const isSidebarCurrentlyVisible = !!isSidebarVisible;
  const isTransitioningToClose = wasSidebarVisible && !isSidebarCurrentlyVisible;

  // Disable sidebar when not on a Quran reader route
  useEffect(() => {
    if (isOnQuranReaderRoute) return;
    dispatch(setIsSidebarNavigationVisible(false));
  }, [dispatch, isOnQuranReaderRoute, normalizedPathname]);

  // Manage sidebar closing animation timing
  // When sidebar becomes visible: cancel any pending close timeout
  // When sidebar starts closing: set closing state and schedule cleanup after transition
  useEffect(() => {
    const wasVisible = !!previousSidebarVisibilityRef.current;
    const isVisible = !!isSidebarVisible;

    if (isVisible) {
      setIsSidebarClosing(false);
      if (sidebarVisibilityTimeoutRef.current) {
        clearTimeout(sidebarVisibilityTimeoutRef.current);
        sidebarVisibilityTimeoutRef.current = null;
      }
    } else if (wasVisible) {
      setIsSidebarClosing(true);
      sidebarVisibilityTimeoutRef.current = setTimeout(() => {
        setIsSidebarClosing(false);
        sidebarVisibilityTimeoutRef.current = null;
      }, sidebarTransitionDuration);
    }

    previousSidebarVisibilityRef.current = isSidebarVisible;

    return () => {
      if (sidebarVisibilityTimeoutRef.current) {
        clearTimeout(sidebarVisibilityTimeoutRef.current);
        sidebarVisibilityTimeoutRef.current = null;
      }
    };
  }, [isSidebarVisible, sidebarTransitionDuration]);

  // Reset sidebar state after Redux hydration on non-Quran reader routes
  useEffect(() => {
    if (hasResetSidebarAfterHydration.current) return;
    if (!isPersistHydrationComplete) return;
    hasResetSidebarAfterHydration.current = true;
    if (isOnQuranReaderRoute) return;
    dispatch(setIsSidebarNavigationVisible(false));
  }, [dispatch, isPersistHydrationComplete, isOnQuranReaderRoute]);

  // Determine whether to render the SidebarNavigation component.
  // We keep it mounted during transitions to allow smooth CSS animations.
  // Conditions:
  // 1. isOnQuranReaderRoute: Always render on Quran reader pages (even if sidebar is hidden)
  // 2. isSidebarVisible: Render when sidebar is actively visible (truthy - true or 'auto')
  // 3. isSidebarClosing: Keep mounted during closing animation (timeout-based state)
  // 4. isTransitioningToClose: Keep mounted during initial transition (ref-based detection)
  const shouldRenderSidebar =
    isOnQuranReaderRoute || !!isSidebarVisible || isSidebarClosing || isTransitioningToClose;

  return {
    isQuranReaderRoute: isOnQuranReaderRoute,
    shouldRenderSidebar,
    isSidebarVisible,
  };
};

export default useSidebarNavigation;
