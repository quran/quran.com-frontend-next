import { useCallback, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import { ToastStatus, useToast } from 'src/components/dls/Toast/Toast';
import LoginContainer from 'src/components/Login/LoginContainer';

const LoginPage = () => {
  const toast = useToast();
  const { query, replace } = useRouter();
  const { t } = useTranslation();

  const getErrorMessage = useCallback(
    (errorId) => {
      if (!isAValidErrorId(errorId)) {
        return t(`common:login-error.${errorId}`);
      }
      return t(`common:login-error.${defaultErrorId}`);
    },
    [t],
  );

  useEffect(() => {
    if (query.error) {
      const errorMessage = getErrorMessage(query.error);
      toast(errorMessage, {
        status: ToastStatus.Error,
      });
      replace('/login', null, { shallow: true });
      // TODO: Record error to Sentry or somewhere
    }
  }, [query.error, toast, replace, t, getErrorMessage]);

  return <LoginContainer />;
};

// TODO: move this to a helper
const validErrorIds = ['AuthenticationError', 'TokenExpiredError', 'GenerateCookieError'];
const defaultErrorId = 'AuthenticationError';
const isAValidErrorId = (errorId) => {
  return validErrorIds.includes(errorId);
};

export default LoginPage;
