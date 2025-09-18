import { useCallback } from 'react';

import { useRouter } from 'next/router';

import { useAuthContext } from '@/contexts/AuthContext';
import { logErrorToSentry } from '@/lib/sentry';
import QueryParam from '@/types/QueryParam';
import { removeUserIdCookie } from '@/utils/auth/login';
import { removeLastSyncAt } from '@/utils/auth/userDataSync';
import { logButtonClick } from '@/utils/eventLogger';
import { ROUTES } from '@/utils/navigation';

type LogoutOptions = {
  eventName?: string;
  redirectToLogin?: boolean;
};

type LogoutFunction = (options?: LogoutOptions) => Promise<void>;

/**
 * Consolidated logout flow used across the app to keep things DRY.
 * - Logs optional analytics event
 * - Calls backend logout API
 * - Clears auth context state
 * - Removes sync timestamp
 * - Optionally redirects to login
 * @returns {LogoutFunction} A function that performs the logout flow with options
 */
const useLogout = (): LogoutFunction => {
  const router = useRouter();
  const { logout: authContextLogout, state } = useAuthContext();

  const run = useCallback(
    async (options?: LogoutOptions) => {
      const { eventName, redirectToLogin = false } = options || {};

      if (eventName) logButtonClick(eventName);

      try {
        authContextLogout();
        removeLastSyncAt();

        if (!redirectToLogin) {
          const redirect = router.asPath;
          await router.replace(`${ROUTES.LOGOUT}?${QueryParam.REDIRECT_TO}=${redirect}`);
        }
      } catch (error) {
        // TODO: Notify user of remote logout failure (e.g., toast/snackbar)
        logErrorToSentry(error, {
          transactionName: 'logout_user',
          metadata: { userId: state?.user?.id },
        });
        // Best-effort local cleanup when server logout fails
        removeUserIdCookie();
      }
    },
    [router, authContextLogout, state?.user?.id],
  );

  return run;
};

export default useLogout;
