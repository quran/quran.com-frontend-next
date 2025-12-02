import useTranslation from 'next-translate/useTranslation';

import styles from './CommunitySection.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';

const CommunitySection = () => {
  const { t } = useTranslation('common');

  const onJoinCommunityClicked = () => {
    logButtonClick('navigation_drawer_join_community');
  };

  return (
    <div className={styles.container}>
      <div className={styles.flow}>
        <div className={styles.title}>{t('community.header')}</div>
        <div>{t('community.sub-header')}</div>
        <Link
          href="https://forms.gle/Lb4TFoxkSzjx5XHx6"
          isNewTab
          className={styles.joinCommunityLink}
        >
          <Button href="" type={ButtonType.Success} onClick={onJoinCommunityClicked}>
            {t('community.cta')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CommunitySection;
