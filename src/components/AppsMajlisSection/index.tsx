import useTranslation from 'next-translate/useTranslation';

import styles from '../Navbar/NavigationDrawer/CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';

const AppsMajlisSection = () => {
  const { t } = useTranslation('developers');
  return (
    <div className={styles.container}>
      <div className={styles.flow}>
        <div className={styles.title}>{t('apps-majlis.tagline')}</div>
        <div>{t('apps-majlis.description')}</div>
        <div>{t('apps-majlis.oauth-pitch')}</div>
        <div className={styles.actions}>
          <Button href="/app-majlis" type={ButtonType.Success}>
            {t('apps-majlis.cta-explore')}
          </Button>
          <Button
            href="https://api-docs.quran.foundation/docs/tutorials/oidc/getting-started-with-oauth2"
            type={ButtonType.Secondary}
            isNewTab
          >
            {t('apps-majlis.cta-oauth')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppsMajlisSection;
