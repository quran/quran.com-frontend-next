import { useEffect } from 'react';

import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import CompleteSignupForm from '@/components/Login/CompleteSignupForm';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import useAuthData from '@/hooks/auth/useAuthData';
import styles from '@/pages/index.module.scss';
import { ROUTES, getLoginNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

const CompleteSignupPage: NextPage = () => {
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

export const getServerSideProps: GetServerSideProps = withSsrRedux('/complete-signup');

export default CompleteSignupPage;
