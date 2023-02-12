import { useEffect } from 'react';

import { useRouter } from 'next/router';
import useSWR from 'swr';

import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const useCurrentUser = () => {
  const router = useRouter();

  const {
    data: userData,
    isValidating,
    error,
  } = useSWR(isLoggedIn() ? makeUserProfileUrl() : null, getUserProfile);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
    }
  }, [router]);

  return {
    user: userData || ({} as typeof userData),
    isLoading: isValidating && !userData,
    error,
  };
};

export default useCurrentUser;
