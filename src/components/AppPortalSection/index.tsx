import useTranslation from 'next-translate/useTranslation';

import styles from '../Navbar/NavigationDrawer/CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';

type AppPortalSectionVariant = 'drawer' | 'inline';

type AppPortalSectionProps = {
  variant?: AppPortalSectionVariant;
};

const AppPortalSection = ({ variant = 'drawer' }: AppPortalSectionProps) => {
  const { t } = useTranslation('developers');

  const content = (
    <div className={styles.flow}>
      {variant === 'drawer' && <div className={styles.title}>{t('app-portal.tagline')}</div>}
      {variant === 'drawer' && <div>{t('app-portal.description')}</div>}
      <div>{t('app-portal.oauth-pitch')}</div>
      <div className={styles.actions}>
        <Button isNewTab href="/apps-portal" type={ButtonType.Success}>
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
  );

  if (variant === 'inline') return content;

  return <div className={styles.container}>{content}</div>;
};

export default AppPortalSection;
