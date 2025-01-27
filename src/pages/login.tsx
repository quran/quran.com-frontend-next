import { useCallback, useEffect } from 'react';

import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import LoginContainer from '@/components/Login/LoginContainer';
import PageContainer from '@/components/PageContainer';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ChaptersData from '@/types/ChaptersData';
import { BANNED_USER_ERROR_ID } from '@/utils/auth/constants';
import { getAllChaptersData } from '@/utils/chapter';
import { getLoginNavigationUrl } from '@/utils/navigation';
import AuthError from 'types/AuthError';

interface Props {
  chaptersData?: ChaptersData;
}

const LoginPage: NextPage<Props> = () => {
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

  return (
    <PageContainer>
      <LoginContainer />
    </PageContainer>
  );
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
