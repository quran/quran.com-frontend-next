import { useEffect } from 'react';

import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

import CompleteSignupForm from '@/components/Login/CompleteSignupForm';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { logErrorToSentry } from '@/lib/sentry';
import styles from '@/pages/index.module.scss';
import UserProfile from '@/types/auth/UserProfile';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { ROUTES } from '@/utils/navigation';

const CompleteSignupPage = () => {
  const router = useRouter();
  const loggedIn = isLoggedIn();
  const {
    data: userData,
    isValidating,
    error,
  } = useSWRImmutable<UserProfile>(loggedIn ? makeUserProfileUrl() : null, getUserProfile);

  const handleSuccess = () => {
    router.push(ROUTES.HOME);
  };

  // Redirect logged-out users
  useEffect(() => {
    if (!loggedIn) router.replace(ROUTES.LOGIN);
  }, [loggedIn, router]);

  // Handle error state
  useEffect(() => {
    if (error) {
      logErrorToSentry(error, {
        transactionName: 'CompleteSignupPage',
        metadata: { error },
      });
      router.push(ROUTES.LOGIN);
    }
  }, [error, router]);

  // Handle loading state (only when logged in)
  if (loggedIn && (isValidating || !userData)) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  if (error) {
    return null;
  }

  return <CompleteSignupForm userData={userData} onSuccess={handleSuccess} />;
};

export default CompleteSignupPage;
