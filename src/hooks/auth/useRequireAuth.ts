import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { isLoggedIn } from '@/utils/auth/login';
import { getLoginNavigationUrl } from '@/utils/navigation';

/**
 * Redirects to the login page if the user is not logged in.
 */
const useRequireAuth = () => {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(getLoginNavigationUrl());
    }
  }, [router]);
};

export default useRequireAuth;
