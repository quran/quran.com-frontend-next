import useTranslation from 'next-translate/useTranslation';

import styles from '../Navbar/NavigationDrawer/CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';

const AppPortalSection = () => {
  const { t } = useTranslation('developers');
  return (
    <div className={styles.container}>
      <div className={styles.flow}>
        <div className={styles.title}>{t('app-portal.tagline')}</div>
        <div>{t('app-portal.description')}</div>
        <div>{t('app-portal.oauth-pitch')}</div>
        <div className={styles.actions}>
          <Button href="/app-portal" type={ButtonType.Success}>
            {t('app-portal.cta-explore')}
          </Button>
          <Button
            href="https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2"
            type={ButtonType.Secondary}
            isNewTab
          >
            {t('app-portal.cta-oauth')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppPortalSection;
