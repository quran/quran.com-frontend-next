import useTranslation from 'next-translate/useTranslation';

import styles from './CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';

const LabsSection = () => {
  const { t } = useTranslation('developers');

  const onLabsClicked = () => {
    logButtonClick('navigation_drawer_labs');
  };

  return (
    <div className={styles.container}>
      <div className={styles.flow}>
        <div>{t('labs-description')}</div>
        <Link href="https://labs.quran.com" isNewTab className={styles.joinCommunityLink}>
          <Button href="" type={ButtonType.Success} onClick={onLabsClicked}>
            {t('labs-cta')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LabsSection;
