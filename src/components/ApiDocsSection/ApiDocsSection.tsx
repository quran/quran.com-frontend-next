import useTranslation from 'next-translate/useTranslation';

import styles from '../Navbar/NavigationDrawer/CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';

type ApiDocsSectionVariant = 'drawer' | 'inline';

type ApiDocsSectionProps = {
  variant?: ApiDocsSectionVariant;
};

const ApiDocsSection = ({ variant = 'drawer' }: ApiDocsSectionProps) => {
  const { t } = useTranslation('developers');

  const content = (
    <div className={styles.flow}>
      {variant === 'drawer' && <div>{t('api-docs.sub-header')}</div>}
      <div className={styles.actions}>
        <Link
          href="https://api-docs.quran.foundation"
          isNewTab
          className={styles.joinCommunityLink}
        >
          <Button href="" type={ButtonType.Success}>
            {t('api-docs.cta')}
          </Button>
        </Link>
      </div>
    </div>
  );

  if (variant === 'inline') return content;

  return <div className={styles.container}>{content}</div>;
};

export default ApiDocsSection;
