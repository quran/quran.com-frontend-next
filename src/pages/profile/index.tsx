import useTranslation from 'next-translate/useTranslation';

import styles from './profile.module.scss';

import withAuth from '@/components/Auth/withAuth';
import HeaderNavigation from '@/components/HeaderNavigation';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import EditDetailsForm from '@/components/Profile/EditDetailsForm';
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
        <div className={styles.topDivider}>
          <Separator />
        </div>
        <PersonalizationForm />
        <EditDetailsForm />
      </PageContainer>
    </>
  );
};

export default withAuth(ProfilePage);
