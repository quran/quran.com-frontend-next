import { useRouter } from 'next/router';

import useIsLoggedIn from './useIsLoggedIn';

import { getLoginNavigationUrl } from '@/utils/navigation';

interface UseRequireAuthReturn {
  isLoggedIn: boolean;
  /**
   * Redirect to login if not authenticated, otherwise execute action
   * @param {() => void} action - Optional callback to execute if authenticated
   * @returns {boolean} True if logged in and action executed, false if redirected
   */
  requireAuth: (action?: () => void) => boolean;
  redirectToLogin: () => void;
}

/**
 * Hook for authentication checks and redirects
 * @returns {UseRequireAuthReturn} Authentication utilities
 */
const useRequireAuth = (): UseRequireAuthReturn => {
  const router = useRouter();
  const { isLoggedIn: userIsLoggedIn } = useIsLoggedIn();

  const redirectToLogin = () => {
    router.push(getLoginNavigationUrl(router.asPath));
  };

  const requireAuth = (action?: () => void): boolean => {
    if (!userIsLoggedIn) {
      redirectToLogin();
      return false;
    }
    action?.();
    return true;
  };

  return {
    isLoggedIn: userIsLoggedIn,
    requireAuth,
    redirectToLogin,
  };
};

export default useRequireAuth;
