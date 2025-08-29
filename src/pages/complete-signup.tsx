import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

import CompleteSignupForm from '@/components/Login/CompleteSignupForm';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { logErrorToSentry } from '@/lib/sentry';
import styles from '@/pages/index.module.scss';
import { getUserProfile } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { ROUTES } from '@/utils/navigation';

const CompleteSignupPage = () => {
  const router = useRouter();
  const {
    data: userData,
    isValidating,
    error,
  } = useSWRImmutable(isLoggedIn() ? makeUserProfileUrl() : null, getUserProfile);

  const handleSuccess = () => {
    router.push(ROUTES.HOME);
  };

  // Handle loading state
  if (isValidating || !userData) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  // Handle error state
  if (error) {
    logErrorToSentry(error, {
      transactionName: 'CompleteSignupPage',
      metadata: { error },
    });

    // Redirect to login if we can't get user data
    router.push(ROUTES.LOGIN);
    return null;
  }

  return <CompleteSignupForm userData={userData} onSuccess={handleSuccess} />;
};

export default CompleteSignupPage;
