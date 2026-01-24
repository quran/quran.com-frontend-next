import { useSelector, shallowEqual } from 'react-redux';

import useDebounceNavbarVisibility from './useDebounceNavbarVisibility';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import { selectNavbar } from '@/redux/slices/navbar';

/**
 * A hook to determine if the navbar should be shown.
 * It combines the redux state `isNavbarVisible` and the onboarding `isActive` state
 * with a debounce to prevent flickering.
 *
 * @returns {boolean} true if the navbar should be shown, false otherwise.
 */
const useShowNavbar = (): boolean => {
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const { isActive } = useOnboarding();
  const showNavbar = useDebounceNavbarVisibility(isNavbarVisible, isActive);

  return showNavbar;
};

export default useShowNavbar;
