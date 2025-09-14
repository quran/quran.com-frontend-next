import useTranslation from 'next-translate/useTranslation';

import styles from '../Navbar/NavigationDrawer/CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';

const CareersSection = () => {
  const { t } = useTranslation('developers');
  return (
    <div className={styles.container}>
      <div className={styles.flow}>
        <div className={styles.title}>{t('careers.header')}</div>
        <Link href="https://quran.foundation/careers" isNewTab className={styles.joinCommunityLink}>
          <Button href="" type={ButtonType.Success}>
            {t('careers.cta')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CareersSection;
