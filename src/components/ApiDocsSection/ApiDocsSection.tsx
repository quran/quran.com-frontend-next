import useTranslation from 'next-translate/useTranslation';

import styles from '../Navbar/NavigationDrawer/CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';

const ApiDocsSection = () => {
  const { t } = useTranslation('developers');
  return (
    <div className={styles.container}>
      <div className={styles.flow}>
        <div>{t('api-docs.sub-header')}</div>
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
};

export default ApiDocsSection;
