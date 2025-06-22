import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import ForgotPasswordForm from '@/components/Login/ForgotPassword/ForgotPasswordForm';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getForgotPasswordNavigationUrl } from '@/utils/navigation';

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

export default ForgotPasswordPage;
