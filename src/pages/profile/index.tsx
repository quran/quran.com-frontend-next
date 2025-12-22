import { useMemo, type FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './profile.module.scss';

import withAuth from '@/components/Auth/withAuth';
import HeaderNavigation from '@/components/HeaderNavigation';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import ChangePasswordForm from '@/components/Profile/ChangePasswordForm';
import EditDetailsForm from '@/components/Profile/EditDetailsForm';
import PersonalizationForm from '@/components/Profile/PersonalizationForm';
import Separator from '@/dls/Separator/Separator';
import useAuthData from '@/hooks/auth/useAuthData';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getProfileNavigationUrl } from '@/utils/navigation';

const ProfilePage: FC = () => {
  const { t, lang } = useTranslation('profile');
  const { userData } = useAuthData();
  const canUpdatePassword = useMemo(() => {
    return userData?.isPasswordSet;
  }, [userData?.isPasswordSet]);

  const profilePath = getProfileNavigationUrl();

  return (
    <>
      <NextSeoWrapper
        title={t('common:profile')}
        url={getCanonicalUrl(lang, profilePath)}
        languageAlternates={getLanguageAlternates(getProfileNavigationUrl())}
        nofollow
        noindex
      />
      <HeaderNavigation title={t('my-profile')} />
      <main className={styles.main}>
        <PageContainer isSheetsLike>
          <div className={styles.topDivider}>
            <Separator />
          </div>
          <div className={styles.wrapper}>
            <PersonalizationForm />
            <EditDetailsForm />
            {canUpdatePassword && <ChangePasswordForm />}
          </div>
        </PageContainer>
      </main>
    </>
  );
};

export default withAuth(ProfilePage);
