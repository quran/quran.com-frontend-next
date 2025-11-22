import { useCallback, useEffect } from 'react';

import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import LoginContainer from '@/components/Login/LoginContainer';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { BANNED_USER_ERROR_ID } from '@/utils/auth/constants';
import { getLoginNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';
import AuthError from 'types/AuthError';

const LoginPage: NextPage = () => {
  const toast = useToast();
  const { query, replace } = useRouter();
  const { t } = useTranslation('login');

  const getErrorMessage = useCallback(
    (errorId) => {
      if (errorId in AuthError) {
        return t(`login-error.${errorId}`);
      }
      if (errorId === BANNED_USER_ERROR_ID) {
        return t(`login-error.${AuthError.BannedUserError}`);
      }
      return t(`login-error.${AuthError.AuthenticationError}`);
    },
    [t],
  );

  useEffect(() => {
    if (query.error) {
      const errorMessage = getErrorMessage(query.error);
      replace(getLoginNavigationUrl(), null, { shallow: true }).then(() => {
        toast(errorMessage, {
          status: ToastStatus.Error,
        });
      });
    }
  }, [query.error, toast, replace, t, getErrorMessage]);

  return <LoginContainer />;
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/login');

export default LoginPage;
