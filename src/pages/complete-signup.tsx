import { useEffect } from 'react';

import { useRouter } from 'next/router';

import CompleteSignupForm from '@/components/Login/CompleteSignupForm';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useAuthData from '@/hooks/auth/useAuthData';
import styles from '@/pages/index.module.scss';
import { getLoginNavigationUrl, ROUTES } from '@/utils/navigation';

const CompleteSignupPage = () => {
  const router = useRouter();
  const { userData, isLoading, userDataError } = useAuthData();

  const handleSuccess = () => {
    router.push(ROUTES.HOME);
  };

  // Handle error state: per docs, log then redirect to login
  useEffect(() => {
    if (userDataError) {
      router.replace(getLoginNavigationUrl());
    }
  }, [userDataError, router]);

  // Handle loading state
  if (isLoading || !userData) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  if (userDataError) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  return <CompleteSignupForm userData={userData} onSuccess={handleSuccess} />;
};

export default CompleteSignupPage;
