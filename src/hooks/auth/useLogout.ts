import { useRouter } from 'next/router';

import { useAuthContext } from '@/contexts/AuthContext';
import { logErrorToSentry } from '@/lib/sentry';
import { logoutUser } from '@/utils/auth/api';
import { removeLastSyncAt } from '@/utils/auth/userDataSync';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl } from '@/utils/navigation';

type LogoutOptions = {
  eventName?: string;
  redirectToLogin?: boolean;
};

/**
 * Consolidated logout flow used across the app to keep things DRY.
 * - Logs optional analytics event
 * - Calls backend logout API
 * - Clears auth context state
 * - Removes sync timestamp
 * - Optionally redirects to login
 * @returns {(options?: LogoutOptions) => Promise<void>} A function that performs the logout flow with options
 */
const useLogout = () => {
  const router = useRouter();
  const { logout: authContextLogout, state } = useAuthContext();

  const run = async (options?: LogoutOptions) => {
    const { eventName, redirectToLogin = false } = options || {};

    if (eventName) logButtonClick(eventName);

    try {
      await logoutUser();
    } catch (error) {
      // TODO: Notify user of remote logout failure (e.g., toast/snackbar)
      logErrorToSentry(error, {
        transactionName: 'logout_user',
        metadata: { userId: state?.user?.id },
      });
    }
    authContextLogout();
    removeLastSyncAt();

    if (redirectToLogin) {
      await router.push(getLoginNavigationUrl());
    }
  };

  return run;
};

export default useLogout;
