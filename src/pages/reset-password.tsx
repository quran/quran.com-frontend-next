import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ResetPasswordForm from '@/components/Login/ResetPassword/ResetPasswordForm';
import NextSeoWrapper from '@/components/NextSeoWrapper';
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
      <ResetPasswordForm />
    </>
  );
};

export default ResetPasswordPage;
