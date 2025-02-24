import React from 'react';

import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ResetPasswordForm from '@/components/Login/ResetPassword/ResetPasswordForm';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getResetPasswordNavigationUrl } from '@/utils/navigation';

const ResetPasswordPage: NextPage = () => {
  const { t } = useTranslation('login');
  const router = useRouter();
  const lang = router.locale;
  return (
    <>
      <NextSeoWrapper
        title={t('reset-password')}
        url={getCanonicalUrl(lang, getResetPasswordNavigationUrl())}
        languageAlternates={getLanguageAlternates(getResetPasswordNavigationUrl())}
        nofollow
        noindex
      />
      <PageContainer>
        <ResetPasswordForm />
      </PageContainer>
    </>
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

export default ResetPasswordPage;
