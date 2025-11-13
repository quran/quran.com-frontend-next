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
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getProfileNavigationUrl } from '@/utils/navigation';

const ProfilePage: React.FC = () => {
  const { t, lang } = useTranslation('profile');

  return (
    <>
      <NextSeoWrapper
        title={t('common:profile')}
        url={getCanonicalUrl(lang, getProfileNavigationUrl())}
        languageAlternates={getLanguageAlternates(getProfileNavigationUrl())}
        nofollow
        noindex
      />
      <HeaderNavigation backUrl={getProfileNavigationUrl()} title={t('my-profile')} />
      <PageContainer isSheetsLike className={styles.wrapper}>
        <PersonalizationForm />
        <EditDetailsForm />
        <ChangePasswordForm />
        <HeadlessServiceProvider>
          <EmailNotificationSettingsForm />
        </HeadlessServiceProvider>
        <div className={styles.divider}>
          <Separator />
        </div>
        <div className={styles.dangerArea}>
          <p className={styles.dangerAreaDescription}>{t('delete-account-warning-description')}</p>
          <div>
            <DeleteAccountButton />
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default withAuth(ProfilePage);
