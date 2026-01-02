import { useMemo, type FC } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './profile.module.scss';

import withAuth from '@/components/Auth/withAuth';
import HeaderNavigation from '@/components/HeaderNavigation';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { HeadlessServiceProvider } from '@/components/Notifications/hooks/useHeadlessService';
import PageContainer from '@/components/PageContainer';
import ChangePasswordForm from '@/components/Profile/ChangePasswordForm';
import DeleteAccountButton from '@/components/Profile/DeleteAccountButton';
import EditDetailsForm from '@/components/Profile/EditDetailsForm';
import EmailNotificationSettingsForm from '@/components/Profile/EmailNotificationSettingsForm';
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
      <PageContainer isSheetsLike>
        <div className={styles.topDivider}>
          <Separator />
        </div>
        <div className={styles.wrapper}>
          <PersonalizationForm />
          <EditDetailsForm />
          {canUpdatePassword && <ChangePasswordForm />}
          <HeadlessServiceProvider>
            <EmailNotificationSettingsForm />
          </HeadlessServiceProvider>
          <div className={styles.divider}>
            <Separator />
          </div>
          <section
            className={styles.deleteAccountSection}
            aria-labelledby="delete-account-section-title"
          >
            <p id="delete-account-section-title" className={styles.deleteAccountSectionDescription}>
              <span className={styles.deleteAccountSectionDescriptionTitle}>
                {t('delete-account-warning-title')}:{' '}
              </span>
              {t('delete-confirmation.subtitle')}
            </p>
            <div>
              <DeleteAccountButton />
            </div>
          </section>
        </div>
      </PageContainer>
    </>
  );
};

export default withAuth(ProfilePage);
