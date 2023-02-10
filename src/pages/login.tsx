import { useCallback, useEffect } from 'react';

import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import LoginContainer from '@/components/Login/LoginContainer';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChaptersData from '@/types/ChaptersData';
import { getAllChaptersData } from '@/utils/chapter';
import AuthError from 'types/AuthError';

type LoginPageProps = {
  chaptersData: ChaptersData;
};

const LoginPage: NextPage<LoginPageProps> = (): JSX.Element => {
  const toast = useToast();
  const { query, replace } = useRouter();
  const { t } = useTranslation('login');

  const getErrorMessage = useCallback(
    (errorId) => {
      if (errorId in AuthError) {
        return t(`login-error.${errorId}`);
      }
      return t(`login-error.${AuthError.AuthenticationError}`);
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
    }
  }, [query.error, toast, replace, t, getErrorMessage]);

  return <LoginContainer />;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default LoginPage;
