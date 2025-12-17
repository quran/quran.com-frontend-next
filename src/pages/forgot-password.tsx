import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ForgotPasswordForm from '@/components/Login/ForgotPassword/ForgotPasswordForm';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getForgotPasswordNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

const ForgotPasswordPage: NextPage = () => {
  const { t } = useTranslation('login');
  const router = useRouter();
  const lang = router.locale;
  return (
    <>
      <NextSeoWrapper
        title={t('forgot-password')}
        url={getCanonicalUrl(lang, getForgotPasswordNavigationUrl())}
        languageAlternates={getLanguageAlternates(getForgotPasswordNavigationUrl())}
        nofollow
        noindex
      />
      <ForgotPasswordForm />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/forgot-password');

export default ForgotPasswordPage;
