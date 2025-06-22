import { useEffect } from 'react';

import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

import CompleteSignupForm from '@/components/Login/CompleteSignupForm';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import styles from '@/pages/index.module.scss';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isCompleteProfile } from '@/utils/auth/complete-signup';
import { isLoggedIn } from '@/utils/auth/login';
import { ROUTES } from '@/utils/navigation';

const CompleteSignupPage = () => {
  const router = useRouter();
  const {
    data: userData,
    error,
    isValidating,
  } = useSWRImmutable(isLoggedIn() ? makeUserProfileUrl() : null, getUserProfile);

  // Check if profile is complete for redirection purposes only
  const isProfileComplete = userData ? isCompleteProfile(userData) : false;

  // Handle redirections
  useEffect(() => {
    // Redirect if not logged in or there was an error fetching profile
    if ((!isLoggedIn() || error) && process.browser) {
      router.push(ROUTES.HOME);
      return;
    }

    // Redirect if profile is already complete
    if (!isValidating && isProfileComplete) {
      router.push(ROUTES.HOME);
    }
  }, [error, isProfileComplete, isValidating, router, userData]);

  const handleSuccess = () => {
    router.push(ROUTES.HOME);
  };

  if (isValidating || !userData) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  return <CompleteSignupForm userData={userData} onSuccess={handleSuccess} />;
};

export default CompleteSignupPage;
